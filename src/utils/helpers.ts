import { ShortcodeConfig } from '../types';
import { CSS_VAR_MAPPING } from './constants';

export function generateStyles(config: ShortcodeConfig): Record<string, string> {
	const styles: Record<string, string> = {};
	
	Object.entries(config).forEach(([key, value]) => {
		if (CSS_VAR_MAPPING[key] && value !== undefined && value !== null && value !== '') {
			const cleanValue = typeof value === 'string' ? value.replace(/^["']|["']$/g, '') : value;
			styles[CSS_VAR_MAPPING[key]] = cleanValue;
		}
	});

	return styles;
}

export function applyStyles(element: HTMLElement, config: ShortcodeConfig): void {
	const styles = generateStyles(config);
	Object.entries(styles).forEach(([property, value]) => {
		element.style.setProperty(property, value);
	});
}

export function cleanAlt(caption: string): string {
	if (!caption) return '';
	
	return caption
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&[^;]+;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function renderMarkdown(text: string): string {
	return text
		.replace(/~~(.*?)~~/g, '<del>$1</del>')
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/`(.*?)`/g, '<code>$1</code>')
		.replace(/<br>/g, '<br>');
}

// Découpe une chaîne sur les virgules en respectant les guillemets
function splitRespectingQuotes(str: string): string[] {
	const parts: string[] = [];
	let current = '';
	let inQuotes = false;
	let quoteChar = '';

	for (let i = 0; i < str.length; i++) {
		const ch = str[i];
		if (inQuotes) {
			if (ch === quoteChar) inQuotes = false;
			current += ch;
		} else if (ch === '"' || ch === "'") {
			inQuotes = true;
			quoteChar = ch;
			current += ch;
		} else if (ch === ',') {
			parts.push(current);
			current = '';
		} else {
			current += ch;
		}
	}
	if (current) parts.push(current);
	return parts;
}

export function parseShortcodeParams(params: string): { src?: string; options: ShortcodeConfig } {
	// Normaliser les sauts de ligne en espaces
	const normalized = params.replace(/\s+/g, ' ').trim();

	const parts = splitRespectingQuotes(normalized);
	let src: string | undefined;
	const options: ShortcodeConfig = {};

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i].trim();
		if (!part) continue;

		// Premier argument positionnel entre guillemets = src
		if (i === 0 && (part.startsWith('"') || part.startsWith("'"))) {
			src = part.replace(/^["']|["']$/g, '');
			continue;
		}

		// Format legacy : { col: 6, caption: "..." }
		if (part.startsWith('{')) {
			try {
				const joined = parts.slice(i).join(',');
				const cleanOptions = joined.replace(/,(\s*[}\]])/g, '$1');
				const parsed = Function(`"use strict"; return (${cleanOptions})`)();
				Object.assign(options, parsed);
			} catch (e) {
				console.warn('Erreur parsing options legacy:', e);
			}
			break;
		}

		// Format 11ty natif : key="value" ou key=number
		const kvMatch = part.match(/^([\w-]+)\s*=\s*["']?([\s\S]*?)["']?$/);
		if (kvMatch) {
			const key = kvMatch[1];
			const val = kvMatch[2].trim();
			(options as Record<string, unknown>)[key] = (val !== '' && !isNaN(Number(val))) ? Number(val) : val;
		}
	}

	return { src, options };
}
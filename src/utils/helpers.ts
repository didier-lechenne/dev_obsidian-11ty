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

	let src: string | undefined;
	const options: ShortcodeConfig = {};

	let remaining = normalized;

	// Premier argument positionnel entre guillemets = src
	const srcMatch = remaining.match(/^(["'])(.*?)\1\s*,?\s*/);
	if (srcMatch) {
		src = srcMatch[2];
		remaining = remaining.substring(srcMatch[0].length);
	}

	// Format legacy : { col: 6, caption: "..." }
	if (remaining.trimStart().startsWith('{')) {
		try {
			const cleanOptions = remaining.replace(/,(\s*[}\]])/g, '$1');
			const parsed = Function(`"use strict"; return (${cleanOptions})`)();
			Object.assign(options, parsed);
		} catch (e) {
			console.warn('Erreur parsing options legacy:', e);
		}
		return { src, options };
	}

	// Match toutes les paires key=value (robuste : pas besoin de virgule)
	const kvRegex = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w./%+-]+))?/g;
	let match;
	while ((match = kvRegex.exec(remaining)) !== null) {
		const key = match[1];
		const val = (match[2] ?? match[3] ?? match[4] ?? '').trim();
		(options as Record<string, unknown>)[key] = (val !== '' && !isNaN(Number(val))) ? Number(val) : val;
	}

	return { src, options };
}
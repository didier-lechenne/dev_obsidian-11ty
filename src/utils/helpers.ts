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
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/`(.*?)`/g, '<code>$1</code>');
}

export function parseShortcodeParams(params: string): { src?: string; options: ShortcodeConfig } {
	params = params.trim();
	
	const match = params.match(/^["']([^"']+)["'](?:\s*,\s*(\{.*\}))?$/);
	
	if (!match) {
		throw new Error('Format de paramètres invalide');
	}

	const src = match[1];
	let options: ShortcodeConfig = {};

	if (match[2]) {
		try {
			const cleanOptions = match[2].replace(/,(\s*[}\]])/g, '$1');
			options = Function(`"use strict"; return (${cleanOptions})`)();
		} catch (e) {
			console.warn('Erreur parsing options:', e);
			options = {};
		}
	}

	return { src, options };
}
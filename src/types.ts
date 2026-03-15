export interface ShortcodeConfig {
	src?: string;
	caption?: string;
	class?: string;
	id?: string;
	cols?: number | string;
	colGap?: string;
	col?: number | string;
	printCol?: number | string;
	width?: string;
	printWidth?: string;
	printRow?: number | string;
	printHeight?: string;
	alignSelf?: string;
	fill?: string;
	poster?: string; // Pour les vidéos
}

export interface ParsedShortcode {
	type: string;
	src?: string;
	options: ShortcodeConfig;
}

export type ShortcodeType = 'image' | 'video' | 'figure' | 'imagenote' | 'markdown' | 'textCol' | 'gallery' | 'columnGrid';

export interface CssVarMapping {
	[key: string]: string;
}
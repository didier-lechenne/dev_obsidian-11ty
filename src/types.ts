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
	ratio?: string; // Pour gallery
	fit?: string;   // Pour gallery
	crop?: string | boolean; // Pour gallery
	columns?: number | string; // Pour gallery
}

export interface ParsedShortcode {
	type: string;
	src?: string;
	options: ShortcodeConfig;
}

export type ShortcodeType = 'image' | 'video' | 'figure' | 'imagenote' | 'markdown' | 'textCol' | 'columnGrid' | 'gallery';

export interface CssVarMapping {
	[key: string]: string;
}
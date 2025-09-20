export interface ShortcodeConfig {
	src?: string;
	caption?: string;
	class?: string;
	id?: string;
	col?: number | string;
	printCol?: number | string;
	width?: string;
	printWidth?: string;
	printRow?: number | string;
	printHeight?: string;
	alignSelf?: string;
	alignself?: string;
	'align-self'?: string;
	imgX?: string;
	imgY?: string;
	imgW?: string;
	page?: string;
	poster?: string; // Pour les vidéos
}

export interface ParsedShortcode {
	type: string;
	src?: string;
	options: ShortcodeConfig;
}



export interface ShortcodeConfig {
	src?: string;
	caption?: string;
	class?: string;
	id?: string;
	col?: number | string;
	printCol?: number | string;
	width?: string;
	printWidth?: string;
	printRow?: number | string;
	printHeight?: string;
	alignSelf?: string;
	alignself?: string;
	'align-self'?: string;
	imgX?: string;
	imgY?: string;
	imgW?: string;
	page?: string;
	poster?: string; // Pour les vidéos
}

export interface ParsedShortcode {
	type: string;
	src?: string;
	options: ShortcodeConfig;
}

export type ShortcodeType = 'image' | 'grid' | 'video' | 'figure' | 'imagenote' | 'fullpage';

export interface CssVarMapping {
	[key: string]: string;
}
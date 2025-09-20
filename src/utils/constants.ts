import { CssVarMapping } from '../types';

export const CSS_VAR_MAPPING: CssVarMapping = {
	col: '--col',
	printCol: '--print-col',
	width: '--width',
	printWidth: '--print-width',
	printRow: '--print-row',
	printHeight: '--print-height',
	alignSelf: '--align-self',
	alignself: '--align-self',
	'align-self': '--align-self',
	imgX: '--img-x',
	imgY: '--img-y',
	imgW: '--img-w',
	page: '--pagedjs-full-page',
};

export const SHORTCODE_REGEX = /\{%\s*(\w+)\s+([^%]+)\s*%\}/g;

export const SUPPORTED_SHORTCODE_TYPES = [
	'image',
	'grid', 
	'video',
	'figure',
	'imagenote',
	'fullpage'
] as const;
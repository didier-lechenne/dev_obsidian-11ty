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

export const MEDIA_TEMPLATES = {
	image: {
		template: '<figure id="{id}" data-type="{type}" data-grid="image" class="figure {type} {classes}" data-src="{src}"{styles}>{media}<figcaption class="figcaption">{caption}</figcaption></figure>'
	},
	imagenote: {
		template: '<span id="{id}" data-type="{type}" class="{type} {classes}" data-src="{src}"{styles}>{media}<span class="figcaption">{caption}</span></span>'
	},
	figure: {
		template: '<figure id="{id}" data-src="{src}" data-type="{type}" data-grid="image" class="{type} {classes}"{styles}>{media}<figcaption class="figcaption">{caption}</figcaption></figure>'
	},
	grid: {
		template: '<figure id="{id}" data-src="{src}" data-type="{type}" data-grid="image" class="figure {type} {classes}"{styles}>{media}</figure><figcaption class="figcaption"{styles}>{caption}</figcaption>'
	},
	fullpage: {
		template: '<figure id="{id}" data-src="{src}" data-type="{type}" data-grid="image" class="full-page figure {type} {classes}"{styles}>{media}</figure>'
	},
	video: {
		template: '<figure id="{id}" data-type="{type}" data-grid="content" class="video {classes}"{styles}>{media}<figcaption class="figcaption">{caption}</figcaption></figure>'
	}
};
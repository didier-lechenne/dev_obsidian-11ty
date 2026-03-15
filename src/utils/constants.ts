import { CssVarMapping } from '../types';

export const CSS_VAR_MAPPING: CssVarMapping = {
	cols: '--grid-col',
	colGap: '--grid-col-gutter',
	col: '--col',
	printCol: '--print-col',
	width: '--width',
	printWidth: '--print-width',
	printRow: '--print-row',
	printHeight: '--print-height',
	alignSelf: '--align-self',
	fill: '--col-fill',
};

// Supporte multi-lignes et les % dans les valeurs (ex: width="50%")
export const SHORTCODE_REGEX = /\{%-?\s*(\w+)\s+([\s\S]*?)\s*-?%\}/g;

// Shortcodes appairés : {% gallery %}...{% endgallery %}
export const PAIRED_SHORTCODE_REGEX = /\{%-?\s*(\w+)\s*([\s\S]*?)-?%\}([\s\S]*?)\{%-?\s*end\1\s*-?%\}/g;

export const SUPPORTED_SHORTCODE_TYPES = [
	'image',
	'video',
	'figure',
	'imagenote',
	'markdown',
	'textCol',
	'columnGrid',
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
	video: {
		template: '<figure id="{id}" data-type="{type}" data-grid="content" class="video {classes}"{styles}>{media}<figcaption class="figcaption">{caption}</figcaption></figure>'
	}
};
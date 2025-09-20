import { ShortcodeConfig, ShortcodeType } from '../types';
import { applyStyles, cleanAlt, renderMarkdown } from './helpers';
import { SUPPORTED_SHORTCODE_TYPES } from './constants';

export class ShortcodeRenderer {
	private globalElementCounter = 0;

	render(type: string, params: { src?: string; options: ShortcodeConfig }): HTMLElement | null {
		if (!SUPPORTED_SHORTCODE_TYPES.includes(type as ShortcodeType)) {
			console.warn(`Type de shortcode non supporté: ${type}`);
			return null;
		}

		const { src, options = {} } = params;
		const config = { src, ...options };

		switch (type as ShortcodeType) {
			case 'image':
				return this.createImageElement(config);
			case 'grid':
				return this.createGridElement(config);
			case 'video':
				return this.createVideoElement(config);
			case 'figure':
				return this.createFigureElement(config);
			case 'imagenote':
				return this.createImageNoteElement(config);
			case 'fullpage':
				return this.createFullPageElement(config);
			default:
				return null;
		}
	}

	private createImageElement(config: ShortcodeConfig): HTMLElement {
		this.globalElementCounter++;
		
		const figure = document.createElement('figure');
		figure.setAttribute('data-id', config.id || '');
		figure.setAttribute('data-src', config.src || '');
		figure.setAttribute('data-grid', 'image');
		figure.id = `image-${this.globalElementCounter}`;
		figure.className = `figure image${config.class ? ' ' + config.class : ''}`;
		
		const img = document.createElement('img');
		img.src = config.src || '';
		img.alt = cleanAlt(config.caption || '');
		
		figure.appendChild(img);
		
		if (config.caption) {
			const figcaption = document.createElement('figcaption');
			figcaption.className = 'figcaption';
			figcaption.innerHTML = renderMarkdown(config.caption);
			figure.appendChild(figcaption);
		}
		
		applyStyles(figure, config);
		return figure;
	}

	private createGridElement(config: ShortcodeConfig): HTMLElement {
		this.globalElementCounter++;
		
		const figure = document.createElement('figure');
		figure.setAttribute('data-id', config.id || '');
		figure.setAttribute('data-src', config.src || '');
		figure.setAttribute('data-grid', 'image');
		figure.id = `figure-${this.globalElementCounter}`;
		figure.className = config.class || '';
		
		const img = document.createElement('img');
		img.src = config.src || '';
		img.alt = cleanAlt(config.caption || '');
		
		figure.appendChild(img);
		applyStyles(figure, config);
		
		if (config.caption) {
			const figcaption = document.createElement('figcaption');
			figcaption.className = `figcaption figcaption-${this.globalElementCounter}`;
			figcaption.innerHTML = renderMarkdown(config.caption);
			applyStyles(figcaption, config);
			
			const wrapper = document.createElement('div');
			wrapper.appendChild(figure);
			wrapper.appendChild(figcaption);
			return wrapper;
		}
		
		return figure;
	}

	private createVideoElement(config: ShortcodeConfig): HTMLElement {
		const figure = document.createElement('figure');
		figure.className = `video${config.class ? ' ' + config.class : ''}`;
		figure.setAttribute('data-grid', 'content');
		
		const video = document.createElement('video');
		video.controls = true;
		if (config.poster) {
			video.poster = config.poster;
		}
		
		const source = document.createElement('source');
		source.src = config.src || '';
		video.appendChild(source);
		
		figure.appendChild(video);
		
		if (config.caption) {
			const figcaption = document.createElement('figcaption');
			figcaption.className = 'figcaption';
			figcaption.innerHTML = renderMarkdown(config.caption);
			figure.appendChild(figcaption);
		}
		
		applyStyles(figure, config);
		return figure;
	}

	private createFigureElement(config: ShortcodeConfig): HTMLElement {
		this.globalElementCounter++;
		
		const wrapper = document.createElement('div');
		
		const spanCall = document.createElement('span');
		spanCall.className = 'spanMove figure_call';
		spanCall.id = `fig-${this.globalElementCounter}-call`;
		
		const link = document.createElement('a');
		link.href = `#fig-${this.globalElementCounter}`;
		link.textContent = `fig. ${this.globalElementCounter}`;
		
		spanCall.appendChild(document.createTextNode('['));
		spanCall.appendChild(link);
		spanCall.appendChild(document.createTextNode(']'));
		
		const spanFig = document.createElement('span');
		spanFig.className = `figure figmove${config.class ? ' ' + config.class : ''}`;
		spanFig.setAttribute('data-src', config.src || '');
		spanFig.setAttribute('data-grid', 'image');
		spanFig.id = `fig-${this.globalElementCounter}`;
		
		const img = document.createElement('img');
		img.src = config.src || '';
		img.alt = cleanAlt(config.caption || '');
		
		spanFig.appendChild(img);
		
		if (config.caption) {
			const captionSpan = document.createElement('span');
			captionSpan.className = 'figcaption';
			
			const refSpan = document.createElement('span');
			refSpan.className = 'figure_reference';
			refSpan.textContent = `[fig. ${this.globalElementCounter}]`;
			
			captionSpan.appendChild(refSpan);
			captionSpan.appendChild(document.createTextNode(' '));
			captionSpan.innerHTML += renderMarkdown(config.caption);
			
			spanFig.appendChild(captionSpan);
		}
		
		applyStyles(spanFig, config);
		
		wrapper.appendChild(spanCall);
		wrapper.appendChild(spanFig);
		return wrapper;
	}

	private createImageNoteElement(config: ShortcodeConfig): HTMLElement {
		const span = document.createElement('span');
		span.className = `imagenote sideNote${config.class ? ' ' + config.class : ''}`;
		span.setAttribute('data-src', config.src || '');
		span.setAttribute('data-grid', 'image');
		
		const img = document.createElement('img');
		img.src = config.src || '';
		img.alt = cleanAlt(config.caption || '');
		
		span.appendChild(img);
		
		if (config.caption) {
			const captionSpan = document.createElement('span');
			captionSpan.className = 'caption';
			captionSpan.innerHTML = renderMarkdown(config.caption);
			span.appendChild(captionSpan);
		}
		
		applyStyles(span, config);
		return span;
	}

	private createFullPageElement(config: ShortcodeConfig): HTMLElement {
		this.globalElementCounter++;
		
		const figure = document.createElement('figure');
		figure.setAttribute('data-id', config.id || '');
		figure.setAttribute('data-src', config.src || '');
		figure.setAttribute('data-grid', 'image');
		figure.id = `figure-${this.globalElementCounter}`;
		figure.className = `full-page${config.class ? ' ' + config.class : ''}`;
		
		const img = document.createElement('img');
		img.src = config.src || '';
		img.alt = cleanAlt(config.caption || '');
		
		figure.appendChild(img);
		applyStyles(figure, config);
		return figure;
	}
}
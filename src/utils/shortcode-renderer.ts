import { App } from 'obsidian';
import { ShortcodeConfig, ShortcodeType } from '../types';
import { applyStyles, cleanAlt, renderMarkdown, generateStyles } from './helpers';
import { SUPPORTED_SHORTCODE_TYPES, MEDIA_TEMPLATES } from './constants';

export class ShortcodeRenderer {
	private globalElementCounter = 0;

	constructor(private app: App) {}

	render(type: string, params: { src?: string; options: ShortcodeConfig }): HTMLElement | null {
		if (!SUPPORTED_SHORTCODE_TYPES.includes(type as ShortcodeType)) {
			console.warn(`Type de shortcode non supporté: ${type}`);
			return null;
		}

		const { src, options = {} } = params;
		const config = { src: this.resolveImagePath(src), ...options };
		
		this.globalElementCounter++;
		
		const template = MEDIA_TEMPLATES[type as keyof typeof MEDIA_TEMPLATES];
		if (!template) return null;

		const templateData = {
			id: config.id || `${type}-${this.globalElementCounter}`,
			type: type,
			classes: config.class || '',
			src: config.src || '',
			media: this.createMediaElement(type, config),
			caption: config.caption ? renderMarkdown(config.caption) : '',
			styles: this.generateStylesString(config)
		};

		const htmlString = this.renderTemplate(template.template, templateData);
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = htmlString;
		
		const element = tempDiv.firstElementChild as HTMLElement;
		if (element) {
			this.addEditOnClick(element);
			
			// Pour grid, gérer la structure multiple
			if (type === 'grid' && tempDiv.children.length > 1) {
				const wrapper = document.createElement('div');
				Array.from(tempDiv.children).forEach(child => wrapper.appendChild(child));
				return wrapper;
			}
		}
		
		return element;
	}

	private resolveImagePath(src: string | undefined): string {
		if (!src) return '';
		
		if (src.startsWith('http') || src.startsWith('app://')) {
			return src;
		}
		
		const file = this.app.metadataCache.getFirstLinkpathDest(src, '');
		if (file) {
			return this.app.vault.getResourcePath(file);
		}
		
		return `app://local/${encodeURIComponent(src)}`;
	}

	private renderTemplate(template: string, data: Record<string, string>): string {
		return template
			.replace(/{id}/g, data.id)
			.replace(/{type}/g, data.type)
			.replace(/{classes}/g, data.classes)
			.replace(/{src}/g, data.src)
			.replace(/{media}/g, data.media)
			.replace(/{caption}/g, data.caption)
			.replace(/{styles}/g, data.styles);
	}

	private createMediaElement(type: string, config: ShortcodeConfig): string {
		if (type === 'video') {
			const posterAttr = config.poster ? ` poster="${config.poster}"` : '';
			return `<video controls${posterAttr}><source src="${config.src}"></video>`;
		}
		
		return `<img src="${config.src}" alt="${cleanAlt(config.caption || '')}">`;
	}

	private generateStylesString(config: ShortcodeConfig): string {
		const styles = generateStyles(config);
		const styleArray = Object.entries(styles).map(([prop, value]) => `${prop}: ${value}`);
		return styleArray.length > 0 ? ` style="${styleArray.join('; ')}"` : '';
	}

	private addEditOnClick(element: HTMLElement): void {
		element.style.cursor = 'pointer';
		element.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			
			const editButton = this.findEditButton(element);
			if (editButton) {
				editButton.click();
			}
		});
	}

	private findEditButton(element: HTMLElement): HTMLElement | null {
		let parent = element.parentElement;
		while (parent) {
			const editButton = parent.querySelector('.edit-block-button') as HTMLElement;
			if (editButton) return editButton;
			parent = parent.parentElement;
		}
		return null;
	}
}
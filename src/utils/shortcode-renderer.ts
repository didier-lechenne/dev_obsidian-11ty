import { App, TFile, MarkdownRenderer, Component } from 'obsidian';
import { ShortcodeConfig, ShortcodeType } from '../types';
import { applyStyles, cleanAlt, renderMarkdown, generateStyles, parseShortcodeParams } from './helpers';
import { SUPPORTED_SHORTCODE_TYPES, MEDIA_TEMPLATES, SHORTCODE_REGEX } from './constants';

export class ShortcodeRenderer {
	private globalElementCounter = 0;

	constructor(private app: App) {}

	// Rend un shortcode enfant (sync ou async selon le type)
	// skipClickHandler=true pour les blocs code (Obsidian gère la navigation nativement)
	private async renderInnerShortcode(innerType: string, innerParams: string): Promise<HTMLElement | null> {
		const parsedParams = parseShortcodeParams(innerParams.trim());
		if (innerType === 'markdown' || innerType === 'textCol') {
			return this.renderMarkdownFile(innerType, parsedParams);
		}
		return this.render(innerType, parsedParams, true);
	}

	// Shortcodes appairés : columnGrid
	async renderPaired(type: string, params: { src?: string; options: ShortcodeConfig }, innerContent: string): Promise<HTMLElement | null> {
		const { options = {} } = params;
		const classAttr = (options as Record<string, unknown>).class as string || '';

		if (type === 'columnGrid') {
			const wrapper = document.createElement('div');
			wrapper.className = `marker columnGrid${classAttr ? ' ' + classAttr : ''}`;

			const innerRegex = new RegExp(SHORTCODE_REGEX.source, 'g');
			let match;
			while ((match = innerRegex.exec(innerContent)) !== null) {
				const [, innerType, innerParams] = match;
				try {
					const el = await this.renderInnerShortcode(innerType, innerParams);
					if (el) wrapper.appendChild(el);
				} catch (e) {
					console.warn('Erreur rendu item columnGrid:', e);
				}
			}
			return wrapper;
		}

		return null;
	}

	// Shortcodes qui lisent un fichier .md depuis le vault (markdown, textCol)
	async renderMarkdownFile(type: string, params: { src?: string; options: ShortcodeConfig }): Promise<HTMLElement | null> {
		const { src, options = {} } = params;
		if (!src) return null;

		const el = document.createElement('div');
		el.setAttribute('data-type', 'markdown');

		// Classes : "textCol [class]" ou "markdown [class]"
		const extraClass = (options as Record<string, unknown>).class as string || '';
		const baseClass = type === 'textCol' ? 'textCol' : 'markdown';
		el.className = [baseClass, extraClass].filter(Boolean).join(' ');

		// Styles CSS vars (cols → --grid-col, fill → --col-fill, alignSelf, etc.)
		const styles = generateStyles(options);
		const styleEntries = Object.entries(styles);
		if (styleEntries.length > 0) {
			el.setAttribute('style', styleEntries.map(([k, v]) => `${k}: ${v}`).join('; '));
		}

		const file = this.app.metadataCache.getFirstLinkpathDest(src, '') ||
		             this.app.vault.getAbstractFileByPath(src);

		if (file instanceof TFile) {
			const content = await this.app.vault.cachedRead(file);
			const wrapper = document.createElement('div');
			wrapper.className = 'content-wrapper';
			await MarkdownRenderer.render(this.app, content, wrapper, file.path, new Component());
			el.appendChild(wrapper);
		} else {
			el.innerHTML = `<em>Fichier introuvable : ${src}</em>`;
		}

		return el;
	}

	render(type: string, params: { src?: string; options: ShortcodeConfig }, skipClickHandler = false): HTMLElement | null {
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
			if (!skipClickHandler) {
				this.addEditOnClick(element);
			}

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
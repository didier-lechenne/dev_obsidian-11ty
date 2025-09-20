import { App, MarkdownPostProcessorContext } from 'obsidian';
import { ShortcodeRenderer } from './shortcode-renderer';
import { parseShortcodeParams } from './helpers';
import { SHORTCODE_REGEX } from './constants';

export class ShortcodeProcessor {
	private renderer: ShortcodeRenderer;

	constructor(private app: App) {
		this.renderer = new ShortcodeRenderer(app);
	}

	// Pour les code blocks (Live Preview)
	processCodeBlock(source: string, el: HTMLElement, ctx: any): void {
		// Détecter le type depuis l'élément parent ou le contenu
		const container = el.parentElement;
		let type = '';
		
		// Cas 1: block spécifique (image, grid, etc.)
		if (container && container.className) {
			const match = container.className.match(/block-language-(\w+)/);
			if (match) {
				type = match[1];
			}
		}
		

		
		// block shortcode avec syntaxe 11ty
		const shortcodeMatch = source.match(/\{%\s*(\w+)\s+([^%]+)\s*%\}/);
		if (!shortcodeMatch) {
			console.warn('Format shortcode invalide dans code block');
			return;
		}
		
		const [, shortcodeType, params] = shortcodeMatch;
		
		try {
			const parsedParams = parseShortcodeParams(params);
			const htmlElement = this.renderer.render(shortcodeType, parsedParams);
			if (htmlElement) {
				el.appendChild(htmlElement);
			}
		} catch (error) {
			console.error('Erreur parsing shortcode:', error);
		}
	}

	processElement(element: HTMLElement, context: MarkdownPostProcessorContext) {
		console.log('Processing element:', element);
		
		// Traiter tous les nœuds, y compris dans les paragraphes
		this.processNodeRecursively(element);
	}

	private processNodeRecursively(node: Node) {
		if (node.nodeType === Node.TEXT_NODE) {
			const textNode = node as Text;
			if (textNode.textContent && this.containsShortcode(textNode.textContent)) {
				this.processTextNode(textNode);
				return;
			}
		}
		
		// Traiter les enfants
		const children = Array.from(node.childNodes);
		children.forEach(child => this.processNodeRecursively(child));
	}

	private containsShortcode(text: string): boolean {
		const hasShortcode = /\{%.*%\}/.test(text);
		if (hasShortcode) {
			console.log('Found shortcode in text:', text);
		}
		return hasShortcode;
	}

	private processTextNode(textNode: Text) {
		const text = textNode.textContent || '';
		const fragments: (string | HTMLElement)[] = [];
		let lastIndex = 0;

		SHORTCODE_REGEX.lastIndex = 0;
		
		let match;
		while ((match = SHORTCODE_REGEX.exec(text)) !== null) {
			if (match.index > lastIndex) {
				fragments.push(text.slice(lastIndex, match.index));
			}

			const [fullMatch, type, params] = match;
			const htmlElement = this.parseAndRender(type, params);
			
			if (htmlElement) {
				fragments.push(htmlElement);
			} else {
				fragments.push(fullMatch);
			}

			lastIndex = match.index + fullMatch.length;
		}

		if (lastIndex < text.length) {
			fragments.push(text.slice(lastIndex));
		}

		if (fragments.length > 1 || (fragments.length === 1 && typeof fragments[0] !== 'string')) {
			const parentNode = textNode.parentNode;
			if (parentNode) {
				fragments.forEach(fragment => {
					if (typeof fragment === 'string') {
						if (fragment.trim()) {
							parentNode.insertBefore(document.createTextNode(fragment), textNode);
						}
					} else {
						parentNode.insertBefore(fragment, textNode);
					}
				});
				parentNode.removeChild(textNode);
			}
		}
	}

	private parseAndRender(type: string, params: string): HTMLElement | null {
		try {
			const parsedParams = parseShortcodeParams(params);
			return this.renderer.render(type, parsedParams);
		} catch (error) {
			console.error('Erreur parsing shortcode:', error);
			return null;
		}
	}
}
import { App, MarkdownPostProcessorContext } from 'obsidian';
import { ShortcodeRenderer } from './shortcode-renderer';
import { parseShortcodeParams } from './helpers';
import { SHORTCODE_REGEX, PAIRED_SHORTCODE_REGEX } from './constants';

export class ShortcodeProcessor {
	private renderer: ShortcodeRenderer;

	constructor(app: App) {
		this.renderer = new ShortcodeRenderer(app);
	}

	// Pour les code blocks ```11ty et blocs spécifiques (```image, ```grid…)
	async processCodeBlock(source: string, el: HTMLElement, _ctx: any): Promise<void> {
		const container = el.parentElement;
		let type = '';

		if (container && container.className) {
			const match = container.className.match(/block-language-(\w+)/);
			if (match) type = match[1];
		}

		// Cas 1 : blocs spécifiques (```image, ```grid, etc.) — source = params bruts
		if (type && type !== 'shortcode' && type !== '11ty') {
			let src = '';
			let options = {};

			if (source.trim()) {
				try {
					const parsed = parseShortcodeParams(source.trim());
					src = parsed.src || '';
					options = parsed.options;
				} catch (e) {
					src = source.trim().replace(/['"]/g, '');
				}
			}

			const htmlElement = this.renderer.render(type, { src, options });
			if (htmlElement) el.appendChild(htmlElement);
			return;
		}

		// Cas 2 : bloc ```11ty — source = shortcode 11ty complet (potentiellement multi-lignes)

		// Shortcode appairé : {% tag params %}...{% endtag %}
		PAIRED_SHORTCODE_REGEX.lastIndex = 0;
		const pairedMatch = PAIRED_SHORTCODE_REGEX.exec(source);
		if (pairedMatch) {
			const [, shortcodeType, params, innerContent] = pairedMatch;
			try {
				const parsedParams = parseShortcodeParams(params.trim());
				const htmlElement = await this.renderer.renderPaired(shortcodeType, parsedParams, innerContent);
				if (htmlElement) el.appendChild(htmlElement);
			} catch (error) {
				console.error('Erreur parsing shortcode appairé:', error);
			}
			return;
		}

		// Shortcode simple : {% tag params %}
		SHORTCODE_REGEX.lastIndex = 0;
		const shortcodeMatch = SHORTCODE_REGEX.exec(source);
		if (!shortcodeMatch) {
			console.warn('Format shortcode invalide dans code block 11ty:', source);
			return;
		}

		const [, shortcodeType, params] = shortcodeMatch;
		try {
			const parsedParams = parseShortcodeParams(params.trim());

			if (shortcodeType === 'markdown' || shortcodeType === 'textCol') {
				const htmlElement = await this.renderer.renderMarkdownFile(shortcodeType, parsedParams);
				if (htmlElement) el.appendChild(htmlElement);
			} else {
				const htmlElement = this.renderer.render(shortcodeType, parsedParams);
				if (htmlElement) el.appendChild(htmlElement);
			}
		} catch (error) {
			console.error('Erreur parsing shortcode:', error);
		}
	}

	processElement(element: HTMLElement, _context: MarkdownPostProcessorContext) {
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
import { MarkdownPostProcessorContext } from 'obsidian';
import { ShortcodeRenderer } from './shortcode-renderer';
import { parseShortcodeParams } from './helpers';
import { SHORTCODE_REGEX } from './constants';

export class ShortcodeProcessor {
	private renderer: ShortcodeRenderer;

	constructor() {
		this.renderer = new ShortcodeRenderer();
	}

	processElement(element: HTMLElement, context: MarkdownPostProcessorContext) {
		const walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			null
		);

		const textNodes: Text[] = [];
		let node;
		while (node = walker.nextNode()) {
			if (node.textContent && this.containsShortcode(node.textContent)) {
				textNodes.push(node as Text);
			}
		}

		textNodes.forEach(textNode => {
			this.processTextNode(textNode);
		});
	}

	private containsShortcode(text: string): boolean {
		return /\{%.*%\}/.test(text);
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
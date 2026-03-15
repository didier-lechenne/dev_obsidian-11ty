import { EditorView, ViewPlugin, Decoration, DecorationSet, ViewUpdate, WidgetType } from '@codemirror/view';
import { RangeSetBuilder, StateEffect, Prec } from '@codemirror/state';
import { ShortcodeRenderer } from './shortcode-renderer';
import { parseShortcodeParams } from './helpers';
import { SHORTCODE_REGEX, PAIRED_SHORTCODE_REGEX } from './constants';

// Regex pour détecter les blocs ```11ty dans le texte brut CM6
const CM6_11TY_REGEX = /```11ty\n([\s\S]*?)\n```/g;

// Effect pour déclencher un re-render après rendu async
const refreshDecorations = StateEffect.define<void>();

class ShortcodeWidget extends WidgetType {
	constructor(readonly html: string) { super(); }

	toDOM(): HTMLElement {
		const wrap = document.createElement('div');
		wrap.className = 'obsidian-11ty-cm6-widget';
		wrap.innerHTML = this.html;
		return wrap;
	}

	eq(other: ShortcodeWidget): boolean {
		return this.html === other.html;
	}

	ignoreEvent(): boolean { return false; }
}

export function createShortcodeViewPlugin(renderer: ShortcodeRenderer) {
	const renderCache = new Map<string, string>();
	const pending = new Set<string>();

	const plugin = ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(private view: EditorView) {
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.selectionSet ||
					update.viewportChanged ||
					update.transactions.some(t => t.effects.some(e => e.is(refreshDecorations)))
				) {
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView): DecorationSet {
				const builder = new RangeSetBuilder<Decoration>();
				const doc = view.state.doc.toString();
				const ranges = view.state.selection.ranges;

				CM6_11TY_REGEX.lastIndex = 0;
				let match: RegExpExecArray | null;

				while ((match = CM6_11TY_REGEX.exec(doc)) !== null) {
					const from = match.index;
					const to = from + match[0].length;

					// Curseur dans le bloc → pas de décoration (édition raw)
					const cursorInside = ranges.some(r => r.from <= to && r.to >= from);
					if (cursorInside) continue;

					const source = match[1].trim();

					if (renderCache.has(source)) {
						const html = renderCache.get(source)!;
						builder.add(from, to, Decoration.replace({
							widget: new ShortcodeWidget(html)
						}));
					} else if (!pending.has(source)) {
						pending.add(source);
						this.renderAsync(source, view);
						// Pendant le rendu → pas de décoration, le texte brut s'affiche
					}
				}

				return builder.finish();
			}

			private async renderAsync(source: string, view: EditorView) {
				let html = '';
				try {
					const el = await renderSource(renderer, source);
					html = el ? el.outerHTML : '';
				} catch (e) {
					html = `<em class="obsidian-11ty-error">Erreur shortcode: ${e}</em>`;
				}
				renderCache.set(source, html);
				pending.delete(source);
				if (view.dom.isConnected) {
					view.dispatch({ effects: refreshDecorations.of() });
				}
			}
		},
		{ decorations: v => v.decorations }
	);

	// Priorité haute pour surcharger le renderer de blocs natif d'Obsidian
	return Prec.highest(plugin);
}

async function renderSource(renderer: ShortcodeRenderer, source: string): Promise<HTMLElement | null> {
	// Shortcode appairé
	const pairedRegex = new RegExp(PAIRED_SHORTCODE_REGEX.source, 'g');
	const pairedMatch = pairedRegex.exec(source);
	if (pairedMatch) {
		const [, type, params, innerContent] = pairedMatch;
		const parsedParams = parseShortcodeParams(params.trim());
		return renderer.renderPaired(type, parsedParams, innerContent);
	}

	// Shortcode simple
	const simpleRegex = new RegExp(SHORTCODE_REGEX.source, 'g');
	const simpleMatch = simpleRegex.exec(source);
	if (!simpleMatch) return null;

	const [, type, params] = simpleMatch;
	const parsedParams = parseShortcodeParams(params.trim());

	if (type === 'markdown' || type === 'textCol') {
		return renderer.renderMarkdownFile(type, parsedParams);
	}
	return renderer.render(type, parsedParams);
}

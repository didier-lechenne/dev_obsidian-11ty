import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ShortcodeProcessor } from './utils/shortcode-processor';

export default class Obsidian11tyPlugin extends Plugin {
	private processor: ShortcodeProcessor;

	async onload() {
		this.processor = new ShortcodeProcessor(this.app);
		
		// Un seul code block "shortcode" pour Live Preview
		this.registerMarkdownCodeBlockProcessor("shortcode", this.processor.processCodeBlock.bind(this.processor));
		
		// Post-processor pour Reading View
		this.registerMarkdownPostProcessor((element, context) => {
			this.processor.processElement(element, context);
		});
	}

	onunload() {
		// Cleanup automatique
	}
}
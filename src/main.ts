import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ShortcodeProcessor } from './utils/shortcode-processor';


// interface MyPluginSettings {
// 	mySetting: string;
// }

// const DEFAULT_SETTINGS: MyPluginSettings = {
// 	mySetting: 'default'
// }

export default class Obsidian11tyPlugin extends Plugin {
	private processor: ShortcodeProcessor;

	async onload() {
		this.processor = new ShortcodeProcessor(this.app);
		
		// Code blocks individuels pour Live Preview
		this.registerMarkdownCodeBlockProcessor("image", this.processor.processCodeBlock.bind(this.processor));
		this.registerMarkdownCodeBlockProcessor("grid", this.processor.processCodeBlock.bind(this.processor));
		this.registerMarkdownCodeBlockProcessor("video", this.processor.processCodeBlock.bind(this.processor));
		this.registerMarkdownCodeBlockProcessor("figure", this.processor.processCodeBlock.bind(this.processor));
		this.registerMarkdownCodeBlockProcessor("imagenote", this.processor.processCodeBlock.bind(this.processor));
		this.registerMarkdownCodeBlockProcessor("fullpage", this.processor.processCodeBlock.bind(this.processor));
		
		// Code block générique pour syntaxe 11ty
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
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
		
		// Code block générique pour syntaxe 11ty
		this.registerMarkdownCodeBlockProcessor("11ty", this.processor.processCodeBlock.bind(this.processor));
		
		// Post-processor pour Reading View
		this.registerMarkdownPostProcessor((element, context) => {
			this.processor.processElement(element, context);
		});

		// Toggle grid markers
		this.addCommand({
			id: 'toggle-grid-markers',
			name: 'Toggle grid markers',
			callback: () => {
				document.body.classList.toggle('no-marker');
			}
		});

	}

	onunload() {
		// Cleanup automatique
	}
}
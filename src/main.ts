import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import {
  DEFAULT_SETTINGS,
  PostToSteemitPluginSettings,
  PostToSteemitSettingTab,
} from './settings';

// Remember to rename these classes and interfaces!

export default class MyPlugin extends Plugin {
  settings: PostToSteemitPluginSettings;

  async onload() {
    console.info('loading obsidian-post-to-steemit plugin');

    await this.loadSettings();

    this.addCommand({
      id: 'obsidian-post-to-steemit',
      name: 'Publish current document to Steemit',
      callback: async () => {
        try {
          console.log('callback', this.settings, this.app);
          const markdownView =
            this.app.workspace.getActiveViewOfType(MarkdownView);
          if (markdownView) {
            console.log(markdownView);
            new Notice('Posted on Steemit!');
          }
        } catch (e) {
          new Notice(e.message);
        }
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new PostToSteemitSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

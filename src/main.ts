import { Plugin } from 'obsidian';
import {
  DEFAULT_SETTINGS,
  PostToSteemitPluginSettings,
  PostToSteemitSettingTab,
} from './settings';
import { SteemitClient } from './steemit-client';

export default class ObsidianPostToSteemitPlugin extends Plugin {
  settings: PostToSteemitPluginSettings;

  async onload() {
    console.info('loading obsidian-post-to-steemit plugin');

    await this.loadSettings();

    this.addRibbonIcon('dice', 'Publish to Steemit', (evt: MouseEvent) => {
      new SteemitClient(this.app, this).newPost();
    });

    this.addCommand({
      id: 'obsidian-post-to-steemit',
      name: 'Publish to Steemit',
      callback: () => {
        new SteemitClient(this.app, this).newPost();
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

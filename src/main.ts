import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitClient } from './steemit-client';
import { SteemitPluginSettings } from './types';

export default class SteemitPlugin extends Plugin {
  settings: SteemitPluginSettings;

  async onload() {
    console.info('loading obsidian-steemit plugin');

    await this.loadSettings();

    this.addRibbonIcon('dice', 'Publish to Steemit', (evt: MouseEvent) => {
      new SteemitClient(this.app, this).newPost();
    });

    this.addCommand({
      id: 'obsidian-steemit',
      name: 'Publish to Steemit',
      callback: () => {
        new SteemitClient(this.app, this).newPost();
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SteemitSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

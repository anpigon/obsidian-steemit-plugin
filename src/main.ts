import { MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitClient } from './steemit-client';
import { SubmitConfirmModal } from './submit_confirm_modal';
import { SteemitPluginSettings } from './types';
import { getPostDataFromActiveView } from './utils';

export default class SteemitPlugin extends Plugin {
  settings?: SteemitPluginSettings;

  async onload() {
    console.info('loading obsidian-steemit plugin');

    await this.loadSettings();

    // this.addRibbonIcon('dice', 'Publish to Steemit', (evt: MouseEvent) => {
    //   this.publishSteemit();
    // });

    this.addCommand({
      id: 'obsidian-steemit',
      name: 'Publish to Steemit',
      callback: () => {
        this.publishSteemit();
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SteemitSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async publishSteemit() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      const data = await getPostDataFromActiveView(this.app, activeView);
      new SubmitConfirmModal(this.app, data, result => {
        console.log(result);
        // new SteemitClient(this.app, this).newPost();
      }).open();
    }
  }
}

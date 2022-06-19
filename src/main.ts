import { MarkdownView, Notice, Plugin } from 'obsidian';
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

    this.addRibbonIcon('dice', 'Publish to Steemit', (evt: MouseEvent) => {
      this.publishSteemit();
    });

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
    try {
      // check username and password
      const { username, password } = this.settings || {};
      if (!username || !password) {
        throw Error('Your account is invalid.');
      }

      // get data on ActiveView
      const data = await getPostDataFromActiveView(this);
      const appName = this.settings?.appName || `${this.manifest.id}/${this.manifest.version}`;
      data.appName = appName;
      data.category = data.category || this.settings?.category || '';

      // create steemit client
      const client = new SteemitClient(username, password);

      // get my community categories
      const categories = (await client.getCommunities(username)).filter(c => c.context.subscribed);

      new SubmitConfirmModal(this.app, data, categories, async result => {
        try {
          const response = await client.broadcast(data);

          const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
          if (activeView) {
            const fileContent = await this.app.vault.cachedRead(activeView.file);
            const newContent = fileContent
              .replace(/^(permlink:).*$/m, `$1 ${result.permlink}`)
              .replace(/^(title:).*$/m, `$1 ${result.title}`)
              .replace(/^(category:).*$/m, `$1 ${result.category}`)
              .replace(/^(tags?:).*$/m, `$1 ${result.tags}`);
            await this.app.vault.modify(activeView.file, newContent);
          }

          new Notice(`Post published successfully! ${response.id}`);
        } catch (ex: any) {
          console.warn(ex);
          new Notice(ex.toString());
        }
      }).open();
    } catch (e: any) {
      new Notice(e.toString());
    }
  }
}

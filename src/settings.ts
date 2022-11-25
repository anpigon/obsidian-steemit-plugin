/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, PluginSettingTab, Setting } from 'obsidian';
import SteemitPlugin from './main';
import { SteemitPluginSettings } from './types';

export const DEFAULT_SETTINGS: SteemitPluginSettings = {
  category: '',
  username: '',
  password: '',
  appName: '',
};

export class SteemitSettingTab extends PluginSettingTab {
  plugin: SteemitPlugin;
  defaultAppName: string;

  constructor(app: App, plugin: SteemitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.defaultAppName = `${this.plugin.manifest.id}/${this.plugin.manifest.version}`;
  }

  async saveSettings(name: string, value: string) {
    if (this.plugin.settings) {
      (this.plugin.settings as any)[name] = value;
      await this.plugin.saveSettings();
    }
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Steemit Settings' });

    new Setting(containerEl)
      .setName('Username')
      .setDesc('Enter your Steemit username')
      .addText(text => {
        text
          .setPlaceholder('Your username')
          .setValue(this.plugin.settings?.username ?? '')
          .onChange(async value => {
            this.saveSettings('username', value);
          });
      });

    new Setting(containerEl)
      .setName('Password')
      .setDesc('Enter your Steemit password (your Steemit privateKey for post).')
      .addText(text => {
        text
          .setPlaceholder('Your password')
          .setValue(this.plugin.settings?.password ?? '')
          .onChange(async value => {
            this.saveSettings('password', value);
          });
        text.inputEl.type = 'password';
      });

    new Setting(containerEl)
      .setName('Default Category (options)')
      .setDesc('Enter the category you want to post.')
      .addText(text => {
        text
          .setPlaceholder('ex. hive-101145')
          .setValue(this.plugin.settings?.category ?? '')
          .onChange(async value => {
            this.saveSettings('category', value);
          });
      });

    new Setting(containerEl)
      .setName('Metadata AppName (options)')
      .setDesc('Enter the app name for the metadata to be published.')
      .addText(text => {
        text
          .setPlaceholder(this.defaultAppName)
          .setValue(this.plugin.settings?.appName || this.defaultAppName)
          .onChange(async value => {
            this.saveSettings('appName', value);
          });
      });
  }
}

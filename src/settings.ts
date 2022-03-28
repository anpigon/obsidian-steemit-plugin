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

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Steemit Settings' });

    new Setting(containerEl)
      .setName('Username')
      .setDesc('Enter your Steemit username')
      .addText(text => {
        text
          .setPlaceholder('anpigon')
          .setValue(this.plugin.settings?.username ?? '')
          .onChange(async value => {
            this.plugin.settings!.username = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Password')
      .setDesc(
        'Enter your Steemit password (your Steemit privateKey for post).',
      )
      .addText(text => {
        text
          .setPlaceholder('Your password')
          .setValue(this.plugin.settings?.password ?? '')
          .onChange(async value => {
            this.plugin.settings!.password = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Default Category (options)')
      .setDesc('Enter the category you want to post.')
      .addText(text => {
        text
          .setPlaceholder('hive-101145')
          .setValue(this.plugin.settings?.category ?? '')
          .onChange(async value => {
            this.plugin.settings!.category = value;
            await this.plugin.saveSettings();
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
            this.plugin.settings!.appName = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

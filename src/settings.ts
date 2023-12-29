/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, PluginSettingTab, Setting } from 'obsidian';
import SteemitPlugin from './main';
import { RewardType, SteemitPluginSettings } from './types';

const safeStorage = window.electron?.remote.safeStorage;

export const DEFAULT_SETTINGS: SteemitPluginSettings = {
  category: '',
  username: '',
  password: '',
  appName: '',
  rewardType: RewardType.DEFAULT,
};

export class SteemitSettingTab extends PluginSettingTab {
  plugin: SteemitPlugin;

  constructor(app: App, plugin: SteemitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async saveSettings(name: keyof SteemitPluginSettings, value: string) {
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
          .setValue(this.plugin.settings?.username || '')
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
          .setValue(this.plugin.settings?.password || '')
          .onChange(async value => {
            if (safeStorage && safeStorage.isEncryptionAvailable() && value) {
              value = safeStorage.encryptString(value).toString('hex');
            }
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
          .setValue(this.plugin.settings?.category || '')
          .onChange(async value => {
            this.saveSettings('category', value);
          });
      });

    new Setting(containerEl).setName('Default Rewards').addDropdown(cb => {
      cb.addOption('100%', 'Power Up 100%');
      cb.addOption('50%', 'Default (50% / 50%)');
      cb.addOption('0%', 'Decline Payout');
      cb.setValue(this.plugin.settings?.rewardType || '50%');
      cb.onChange(value => this.saveSettings('rewardType', value));
    });
  }
}

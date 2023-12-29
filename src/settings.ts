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
  private readonly plugin: SteemitPlugin;

  constructor(app: App, plugin: SteemitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async saveSettings(name: keyof SteemitPluginSettings, value: string | RewardType) {
    if (this.plugin.settings && this.plugin.settings[name] !== value) {
      this.plugin.settings[name] = value as RewardType;
      await this.plugin.saveSettings();
    }
  }

  createSetting(
    containerEl: HTMLElement,
    {
      type,
      key,
      name,
      desc,
      placeholder,
      choices,
      defaultValue,
    }: {
      type: 'text' | 'password' | 'dropdown';
      key: keyof SteemitPluginSettings;
      name: string;
      desc: string;
      placeholder?: string;
      choices?: { value: string; label: string }[];
      defaultValue?: string;
    },
  ) {
    const setting = new Setting(containerEl).setName(name);

    if (desc) {
      setting.setDesc(desc);
    }

    if (type === 'text') {
      setting.addText(text => {
        if (placeholder) text.setPlaceholder(placeholder);
        text.setValue(this.plugin.settings?.[key] || '');
        text.onChange(async value => {
          this.saveSettings(key, value);
        });
      });
    }
    if (type === 'password') {
      setting.addText(text => {
        if (placeholder) text.setPlaceholder(placeholder);
        text.setValue(this.plugin.settings?.[key] || '');
        text.onChange(async value => {
          if (safeStorage && safeStorage.isEncryptionAvailable() && value) {
            value = safeStorage.encryptString(value).toString('hex');
          }
          this.saveSettings(key, value);
        });
        text.inputEl.type = 'password';
      });
    } else if (type === 'dropdown') {
      setting.addDropdown(cb => {
        choices?.forEach(choice => {
          cb.addOption(choice.value, choice.label);
        });
        cb.setValue(this.plugin.settings?.[key] || defaultValue || '');
        cb.onChange(value => this.saveSettings(key, value));
      });
    }
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Steemit Settings' });

    this.createSetting(containerEl, {
      type: 'text',
      key: 'username',
      name: 'Username',
      desc: 'Enter your Steemit username',
      placeholder: 'Your username',
      defaultValue: this.plugin.settings?.username,
    });

    this.createSetting(containerEl, {
      type: 'password',
      key: 'password',
      name: 'Password',
      desc: 'Enter your Steemit password (your Steemit privateKey for post).',
      placeholder: 'Your password',
      defaultValue: this.plugin.settings?.password,
    });

    this.createSetting(containerEl, {
      type: 'text',
      key: 'appName',
      name: 'Default Category (options)',
      desc: 'Enter the category you want to post.',
      placeholder: 'ex. hive-101145',
      defaultValue: this.plugin.settings?.category,
    });
    this.createSetting(containerEl, {
      type: 'dropdown',
      key: 'rewardType',
      name: 'Default Rewards',
      desc: 'Choose your default rewards.',
      choices: [
        { value: RewardType.SP, label: 'Power Up 100%' },
        { value: RewardType.DEFAULT, label: 'Default (50% / 50%)' },
        { value: RewardType.DP, label: 'Decline Payout' },
      ],
      defaultValue: this.plugin.settings?.rewardType,
    });
  }
}

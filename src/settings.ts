/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, PluginSettingTab, Setting } from 'obsidian';
import SteemitPlugin from './main';
import { RewardType, SteemitPluginSettings } from './types';
import Encrypt from './encrypt';

export const DEFAULT_SETTINGS: SteemitPluginSettings = {
  category: '',
  username: '',
  password: '',
  appName: '',
  rewardType: RewardType.DEFAULT,
};

interface CreateSettingArgs {
  type: 'text' | 'dropdown';
  key: keyof SteemitPluginSettings;
  name: string;
  desc: string;
  placeholder?: string;
  choices?: { value: string; label: string }[];
  defaultValue?: string;
  isSecret?: boolean;
}

export class SteemitSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: SteemitPlugin,
  ) {
    super(app, plugin);
  }

  async saveSettings(name: keyof SteemitPluginSettings, value: string | RewardType) {
    if (this.plugin.settings && this.plugin.settings[name] !== value) {
      this.plugin.settings[name] = value as RewardType;
      await this.plugin.saveSettings();
    }
  }

  createSetting(
    containerEl: HTMLElement,
    { type, key, name, desc, placeholder, choices, defaultValue, isSecret }: CreateSettingArgs,
  ) {
    const setting = new Setting(containerEl).setName(name);

    if (desc) {
      setting.setDesc(desc);
    }

    if (type === 'text') {
      setting.addText(text => {
        if (isSecret) text.inputEl.type = 'password';
        if (placeholder) text.setPlaceholder(placeholder);
        text.setValue(this.plugin.settings?.[key] || '');
        text.onChange(async value => {
          if (isSecret && value) {
            value = Encrypt.encryptString(value);
          }
          this.saveSettings(key, value);
        });
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
      type: 'text',
      isSecret: true,
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
      defaultValue: this.plugin.settings?.rewardType,
      choices: [
        { value: RewardType.SP, label: 'Power Up 100%' },
        { value: RewardType.DEFAULT, label: 'Default (50% / 50%)' },
        { value: RewardType.DP, label: 'Decline Payout' },
      ],
    });
  }
}

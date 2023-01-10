/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { TransactionConfirmation } from 'dsteem/lib/steem/transaction';
import { Modal, Setting, Notice } from 'obsidian';

import SteemitPlugin from '../main';
import { SteemitClient } from '../steemit-client';
import { RewardType, SteemitPost, SteemitPostOptions } from '../types';
import CustomLoadingComponent from './loading_component';

export class SubmitConfirmModal extends Modal {
  private client: SteemitClient;
  private postOptions: SteemitPostOptions = {
    rewardType: RewardType.DEFAULT,
    appName: '',
  };

  constructor(
    readonly plugin: SteemitPlugin,
    readonly postData: SteemitPost,
    readonly callback: (variables: SteemitPost, response: TransactionConfirmation) => void,
  ) {
    super(plugin.app);

    // check username and password
    const {
      username,
      password,
      rewardType: defaultRewardType,
      appName: defaultAppName,
      category: defaultCategory,
    } = plugin.settings ?? {};
    if (!plugin.settings || !username || !password) {
      throw Error('Your steemit username or password is invalid.');
    }

    this.client = new SteemitClient(username, password);

    this.postData.category = this.postData.category || defaultCategory || '0';
    this.postOptions.rewardType = defaultRewardType ?? RewardType.DEFAULT;
    this.postOptions.appName = defaultAppName || `${plugin.manifest.id}/${plugin.manifest.version}`;
  }

  async handleSubmit() {
    try {
      this.close();
      const response = await this.client.newPost(this.postData, this.postOptions);
      this.callback(this.postData, response);
    } catch (ex: any) {
      console.warn(ex);
      new Notice(ex.toString());
    }
  }

  async getCommunityCategories() {
    const myCommunities = await this.client.getMyCommunities();
    const categoryOptions = myCommunities.reduce<Record<string, string>>(
      (a, b) => ({ ...a, [b.name]: b.title }),
      {},
    );
    return {
      '0': 'My Blog',
      ...categoryOptions,
    };
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.classList?.add('steem-plugin');

    contentEl.createEl('h2', { text: 'Publish to steemit' });

    const loading = CustomLoadingComponent(contentEl);
    const communityCategories = await this.getCommunityCategories();

    // get my community categories
    new Setting(contentEl).setName('Community').addDropdown(async cb => {
      cb.addOptions(communityCategories);
      cb.setValue(this.postData.category);
      cb.onChange(value => (this.postData.category = value));
    })
    .setClass('no-border');
    new Setting(contentEl)
      .setName('Permlink')
      .addText(cb => {
        cb.setValue(this.postData.permlink);
        cb.onChange(value => (this.postData.permlink = value));
      })
      .setClass('full-width');
    new Setting(contentEl)
      .setName('Title')
      .addText(cb => {
        cb.setValue(this.postData.title);
        cb.onChange(value => (this.postData.title = value));
      })
      .setClass('no-border')
      .setClass('full-width');
    new Setting(contentEl)
      .setName('Tags')
      .addText(cb => {
        cb.setValue(this.postData.tags);
        cb.onChange(value => (this.postData.tags = value));
      })
      .setClass('no-border')
      .setClass('full-width');
    new Setting(contentEl).setName('Rewards').addDropdown(cb => {
      cb.addOption(RewardType.SP, 'Power Up 100%');
      cb.addOption(RewardType.DEFAULT, 'Default (50% / 50%)');
      cb.addOption(RewardType.DP, 'Decline Payout');
      cb.setValue(this.postOptions.rewardType);
      cb.onChange(value => (this.postOptions.rewardType = value as RewardType));
    });
    new Setting(contentEl)
      .setName('AppName')
      .addText(cb => {
        cb.setValue(this.postOptions.appName);
        cb.setDisabled(true);
      })
      .setClass('no-border');

    // buttons
    new Setting(contentEl)
      .addButton(btn => {
        btn.setButtonText('Cancel');
        btn.onClick(() => this.close());
      })
      .addButton(btn => {
        btn.setCta();
        btn.setButtonText('Publish');
        btn.onClick(() => this.handleSubmit());
      });

    loading.remove();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

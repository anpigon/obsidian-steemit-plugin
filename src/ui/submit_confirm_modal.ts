/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Modal, Notice, Setting } from 'obsidian';

import SteemitPlugin from '../main';
import { RewardType, SteemitPost, SteemitPostOptions } from '../types';
import CustomLoadingComponent from './loading_component';
import { RewardTypeOptions } from '../constants';

export class SubmitConfirmModal extends Modal {
  private postOptions: SteemitPostOptions = {
    rewardType: RewardType.DEFAULT,
    appName: '',
  };

  constructor(
    readonly plugin: SteemitPlugin,
    readonly postData: SteemitPost,
    readonly callback: (variables: SteemitPost, postOptions: SteemitPostOptions) => void,
  ) {
    super(plugin.app);
    this.initializePostOptions();
  }

  // postOptions 초기화
  private initializePostOptions() {
    this.postData.category = this.postData.category || this.plugin.settings?.category || '0';
    this.postOptions.rewardType = this.plugin.settings?.rewardType || RewardType.DEFAULT;
    this.postOptions.appName = `${this.plugin.manifest.id}/${this.plugin.manifest.version}`;
  }

  // 커뮤니티 카테고리를 가져온다.
  async getCommunityCategories(category?: string) {
    const myCommunities = await this.plugin.client?.getMyCommunities();
    const categoryOptions = myCommunities?.reduce<Record<string, string>>(
      (a, b) => ({ ...a, [b.name]: b.title }),
      {},
    );
    return {
      '0': 'My Blog',
      ...categoryOptions,
    };
  }

  async handleSubmit() {
    if (!this.postData.permlink) {
      new Notice('Permlink is required');
      return;
    }
    if (!this.postData.title) {
      new Notice('Title is required');
      return;
    }
    if (!this.postData.tags) {
      new Notice('Tags is required');
      return;
    }

    this.callback(this.postData, this.postOptions);
    this.close();
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.classList?.add('steem-plugin');

    contentEl.createEl('h2', { text: 'Publish to steemit' });

    const loading = CustomLoadingComponent(contentEl);
    const communityCategories = await this.getCommunityCategories();

    // get my community categories
    new Setting(contentEl)
      .setName('Community')
      .setClass('no-border')
      .addDropdown(async cb => {
        cb.addOptions(communityCategories);
        cb.setValue(this.postData.category);
        cb.onChange(value => (this.postData.category = value));
      });

    new Setting(contentEl)
      .setName('Permlink')
      .setClass('full-width')
      .addText(cb => {
        cb.setValue(this.postData.permlink);
        cb.onChange(value => (this.postData.permlink = value));
      });

    new Setting(contentEl)
      .setName('Title')
      .setClass('no-border')
      .setClass('full-width')
      .addText(cb => {
        cb.setValue(this.postData.title);
        cb.onChange(value => (this.postData.title = value));
      });

    new Setting(contentEl)
      .setName('Tags')
      .setClass('no-border')
      .setClass('full-width')
      .addText(cb => {
        cb.setValue(this.postData.tags);
        cb.onChange(value => (this.postData.tags = value));
      });

    new Setting(contentEl).setName('Rewards').addDropdown(cb => {
      for (const { value, label } of RewardTypeOptions) {
        cb.addOption(value, label);
      }
      cb.setValue(this.postOptions.rewardType);
      cb.onChange(value => (this.postOptions.rewardType = value as RewardType));
    });

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

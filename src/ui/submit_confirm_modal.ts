/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Modal, Notice, Setting } from 'obsidian';

import SteemitPlugin from '../main';
import { RewardType, SteemitPost, SteemitPostOptions } from '../types';
import CustomLoadingComponent from './loading_component';
import { RewardTypeOptions } from '../helpers/constants';

export class SubmitConfirmModal extends Modal {
  private postOptions: SteemitPostOptions = {
    rewardType: RewardType.DEFAULT,
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
    this.postData.category = this.postData.category || this.plugin.settings?.category || '';
	this.postData.tags = this.postData.tags || this.plugin.settings?.tags || '';
    this.postOptions.rewardType = this.plugin.settings?.rewardType || RewardType.DEFAULT;
  }

  // 커뮤니티 카테고리를 가져온다.
  async getCommunityCategories(category?: string) {
    try {
      const myCommunities = await this.plugin.client?.getMyCommunities();
      const categoryOptions = myCommunities?.reduce<Record<string, string>>(
        (acc, community) => ({ ...acc, [community.name]: community.title }),
        {},
      );

      return {
        '': 'My Blog',
        ...(category && { [category]: 'My Blog' }),
        ...categoryOptions,
      };
    } catch (error) {
      console.error(error);
      new Notice('Error fetching community categories. Please check your settings.');
      return { '': 'My Blog' };
    }
  }

  validateRequiredFields() {
    const requiredFields: Array<keyof SteemitPost> = ['permlink', 'title', 'tags'];
    const missingFields = requiredFields.filter(field => !this.postData[field]);

    if (missingFields.length > 0) {
      new Notice(`The following fields are required: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  }

  async handleSubmit() {
    if (this.validateRequiredFields()) {
      try {
        this.callback(this.postData, this.postOptions);
        this.close();
      } catch (error) {
        console.error(error);
        new Notice('Error publishing post. Please check your settings.');
      }
    }
  }

  createUI(contentEl: HTMLElement, communityCategories: Record<string, string>) {
    // get my community categories
    new Setting(contentEl)
      .setName('Community')
      .setClass('no-border')
      .addDropdown(async cb => {
        cb.addOptions(communityCategories);
        cb.setValue(this.postData.category);
        cb.onChange(value => (this.postData.category = value));

        // 카테고리가 있으면 disabled
        if (this.postData.category && this.postData.permlink) {
          cb.setDisabled(true);
        }
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
        cb.setValue(this.postData.tags)
          .setPlaceholder('tag1, tag2, tag3')
          .onChange(value => (this.postData.tags = value));
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
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.classList?.add('steem-plugin');
    contentEl.createEl('h2', { text: 'Publish to steemit' });

    const loading = CustomLoadingComponent(contentEl);
    try {
      const communityCategories = await this.getCommunityCategories(this.postData.category);
      this.createUI(contentEl, communityCategories);
    } catch (error) {
      console.error('UI creation errors:', error);
      new Notice('An error occurred while generating the UI. Please check the console.');
    } finally {
      loading.remove();
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

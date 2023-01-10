/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { TransactionConfirmation } from 'dsteem/lib/steem/transaction';
import { Modal, Setting, Notice } from 'obsidian';

import SteemitPlugin from '../main';
import { SteemitClient } from '../steemit-client';
import { SteemitPost } from '../types';
import { parsePostData } from '../utils';
import CustomLoadingComponent from './loading_component';

export class SubmitConfirmModal extends Modal {
  private client: SteemitClient;

  constructor(
    private plugin: SteemitPlugin,
    private readonly callback: (data: SteemitPost, response: TransactionConfirmation) => void,
  ) {
    super(plugin.app);

    // check username and password
    const { username, password } = this.plugin.settings ?? {};
    if (!this.plugin.settings || !username || !password) {
      throw Error('Your steemit username or password is invalid.');
    }

    this.client = new SteemitClient(username, password);
  }

  async handleSubmit(data: SteemitPost) {
    try {
      this.close();

      const response = await this.client.newPost(data);

      if (this.callback) {
        this.callback(data, response);
      }
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
    const postData = await parsePostData(this.plugin);
    const communityCategories = await this.getCommunityCategories();

    // get my community categories
    new Setting(contentEl).setName('Community').addDropdown(async cb => {
      cb.addOptions(communityCategories);
      cb.setValue('0');
      cb.onChange(value => (postData.category = value));
    });
    new Setting(contentEl)
      .setName('Permlink')
      .addText(cb => {
        cb.setValue(`${postData.permlink ?? ''}`);
        cb.onChange(value => (postData.permlink = value));
      })
      .setClass('full-width');
    new Setting(contentEl)
      .setName('Title')
      .addText(cb => {
        cb.setValue(`${postData.title ?? ''}`);
        cb.onChange(value => (postData.title = value));
      })
      .setClass('no-underline')
      .setClass('full-width');
    new Setting(contentEl)
      .setName('Tags')
      .addText(cb => {
        cb.setValue(`${postData.tags ?? ''}`);
        cb.onChange(value => (postData.tags = value));
      })
      .setClass('no-underline')
      .setClass('full-width');
    new Setting(contentEl).setName('Rewards').addDropdown(cb => {
      cb.addOption('100%', 'Power Up 100%');
      cb.addOption('50%', 'Default (50% / 50%)');
      cb.addOption('0%', 'Decline Payout');
      cb.setValue('50%');
    });
    new Setting(contentEl)
      .setName('AppName')
      .addText(cb => {
        cb.setValue(`${postData.appName ?? ''}`);
        cb.setDisabled(true);
      })
      .setClass('no-underline');

    // buttons
    new Setting(contentEl)
      .addButton(btn => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton(btn =>
        btn
          .setButtonText('Publish')
          .setCta()
          .onClick(() => this.handleSubmit(postData)),
      );

    loading.remove();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

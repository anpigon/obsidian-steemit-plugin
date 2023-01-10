/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { TransactionConfirmation } from 'dsteem/lib/steem/transaction';
import { Modal, Setting, Notice } from 'obsidian';

import SteemitPlugin from '../main';
import { SteemitClient } from '../steemit-client';
import { SteemitPost } from '../types';
import { parsePostData } from '../utils';
import CustomDropdownComponent from './dropdown_component';
import CustomFormInputComponent from './forminput_compoent';
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
      (a, b) => ({
        ...a,
        [b.name]: b.title,
      }),
      {},
    );
    return {
      '0': 'My Blog',
      ...categoryOptions,
    };
  }

  async onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Publish to steemit' });

    const loading = CustomLoadingComponent(contentEl);
    const postData = await parsePostData(this.plugin);

    // get my community categories
    CustomDropdownComponent(contentEl.createDiv({ cls: 'steem-plugin__container' }), {
      options: await this.getCommunityCategories(),
      value: postData.category || '0',
      onChange: value => (postData.category = value),
    });
    CustomFormInputComponent(contentEl, {
      label: 'permlink',
      value: postData.permlink ?? '',
      onChange: value => (postData.permlink = value),
    });
    CustomFormInputComponent(contentEl, {
      label: 'title',
      value: postData.title ?? '',
      onChange: value => (postData.title = value),
    });
    CustomFormInputComponent(contentEl, {
      label: 'tag',
      value: postData.tags ?? '',
      onChange: value => (postData.tags = value),
    });
    CustomFormInputComponent(contentEl, {
      label: 'appName',
      value: postData.appName ?? '',
      disabled: true,
    });

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

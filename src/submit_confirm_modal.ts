/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { TransactionConfirmation } from 'dsteem/lib/steem/transaction';
import { Modal, Setting, TextComponent, DropdownComponent, Notice } from 'obsidian';

import SteemitPlugin from './main';
import { SteemitClient } from './steemit-client';
import { SteemitPost } from './types';
import { getPostDataFromActiveView } from './utils';

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
      if (!data.category || data.category === '0') {
        data.category = '';
      }
      this.close();

      const response = await this.client.newPost(data);
      
      if (this.callback) this.callback(data, response);
    } catch (ex: any) {
      console.warn(ex);
      new Notice(ex.toString());
    }
  }

  createContainer(containerEl: HTMLElement, label?: string) {
    const container: HTMLDivElement = containerEl.createDiv({ cls: 'steem-plugin__container' });
    if (label) {
      container.createSpan({
        text: `${label}: `,
        cls: 'steem-plugin__label',
      });
    }
    return container;
  }

  async onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Publish to steemit' });
    const loading: HTMLDivElement = contentEl.createDiv({
      text: 'Waiting...',
      cls: 'steem-plugin__loading',
    });

    const data = await getPostDataFromActiveView(this.plugin);

    // get my community categories
    const categories = (await this.client.getMyCommunities()).filter(c => c.context.subscribed);
    loading.remove();

    const categoryContainer = this.createContainer(contentEl);
    const categoryComponent = new DropdownComponent(categoryContainer);
    categoryComponent.addOption('0', 'My Blog');
    categoryComponent.addOptions(
      categories.reduce<{ [k in string]: string }>((a, b) => {
        a[b.name] = b.title;
        return a;
      }, {}),
    );
    categoryComponent.setValue(data.category || '0');
    categoryComponent.onChange(value => (data.category = value));

    const permlinkContainer = this.createContainer(contentEl, 'permlink');
    const permlinkComponent = new TextComponent(contentEl);
    permlinkComponent.inputEl.className = 'steem-plugin__w80';
    permlinkComponent.setValue(data.permlink ?? '');
    permlinkComponent.onChange(value => (data.permlink = value));
    permlinkContainer.appendChild(permlinkComponent.inputEl);

    const titleContainer = this.createContainer(contentEl, 'title');
    const titleComponent = new TextComponent(contentEl);
    titleComponent.inputEl.className = 'steem-plugin__w80';
    titleComponent.setValue(data.title ?? '');
    titleComponent.onChange(value => (data.title = value));
    titleContainer.appendChild(titleComponent.inputEl);

    const tagContainer = this.createContainer(contentEl, 'tag');
    const tagComponent = new TextComponent(contentEl);
    tagComponent.inputEl.className = 'steem-plugin__w80';
    tagComponent.setValue(data.tags ?? '');
    tagComponent.onChange(value => (data.tags = value));
    tagContainer.appendChild(tagComponent.inputEl);

    const appNameContainer = this.createContainer(contentEl, 'appName');
    const appNameComponent = new TextComponent(contentEl);
    appNameComponent.inputEl.className = 'steem-plugin__w80';
    appNameComponent.setDisabled(true);
    appNameComponent.setValue(data.appName ?? '');
    appNameContainer.appendChild(appNameComponent.inputEl);

    // buttons
    new Setting(contentEl)
      .addButton(btn => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton(btn =>
        btn
          .setButtonText('Publish')
          .setCta()
          .onClick(() => this.handleSubmit(data)),
      );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

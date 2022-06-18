import { App, Modal, Setting, TextComponent, DropdownComponent } from 'obsidian';
import { SteemitPost } from './types';

export class SubmitConfirmModal extends Modal {
  data: SteemitPost;
  callback: (data: SteemitPost) => void;

  constructor(app: App, data: SteemitPost, callback: (data: SteemitPost) => void) {
    super(app);
    this.data = data;
    this.callback = callback;
  }

  handleCallback() {
    this.callback(this.data);
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

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Posting on Steemit' });

    const categoryContainer = this.createContainer(contentEl);
    new DropdownComponent(categoryContainer);

    const permlinkContainer = this.createContainer(contentEl, 'permlink');
    const permlinkComponent = new TextComponent(contentEl);
    permlinkComponent.inputEl.className = 'steem-plugin__w80';
    permlinkComponent.setValue(this.data.permlink ?? '');
    permlinkComponent.onChange(value => (this.data.permlink = value));
    permlinkContainer.appendChild(permlinkComponent.inputEl);

    const titleContainer = this.createContainer(contentEl, 'title');
    const titleComponent = new TextComponent(contentEl);
    titleComponent.inputEl.className = 'steem-plugin__w80';
    titleComponent.setValue(this.data.title ?? '');
    titleComponent.onChange(value => (this.data.title = value));
    titleContainer.appendChild(titleComponent.inputEl);

    const tagContainer = this.createContainer(contentEl, 'tag');
    const tagComponent = new TextComponent(contentEl);
    tagComponent.inputEl.className = 'steem-plugin__w80';
    tagComponent.setValue(this.data.tags ?? '');
    tagComponent.onChange(value => (this.data.tags = value));
    tagContainer.appendChild(tagComponent.inputEl);

    // buttons
    new Setting(contentEl)
      .addButton(btn => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton(btn =>
        btn
          .setButtonText('Ok')
          .setCta()
          .onClick(() => this.handleCallback()),
      );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

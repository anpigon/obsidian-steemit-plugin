import { App, Modal, Setting, TextComponent, DropdownComponent } from 'obsidian';
import { SteemitPost, SteemitRPCCommunities } from './types';

export class SubmitConfirmModal extends Modal {
  constructor(
    app: App,
    private data: SteemitPost,
    private categories: SteemitRPCCommunities['result'],
    private readonly callback: (data: SteemitPost) => void,
  ) {
    super(app);
  }

  async handleCallback() {
    if(!this.data.category || this.data.category === '0') {
      this.data.category = '';
    }
    this.close();
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

    contentEl.createEl('h2', { text: 'Publish to steemit' });

    const categoryContainer = this.createContainer(contentEl);
    const categoryComponent = new DropdownComponent(categoryContainer);
    categoryComponent.addOption('0', 'My Blog');
    categoryComponent.addOptions(
      this.categories.reduce<{ [k in string]: string }>((a, b) => {
        a[b.name] = b.title;
        return a;
      }, {}),
    );
    categoryComponent.setValue(this.data.category || '0');
    categoryComponent.onChange(value => (this.data.category = value));

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

    const appNameContainer = this.createContainer(contentEl, 'appName');
    const appNameComponent = new TextComponent(contentEl);
    appNameComponent.inputEl.className = 'steem-plugin__w80';
    appNameComponent.setDisabled(true);
    appNameComponent.setValue(this.data.appName ?? '');
    appNameContainer.appendChild(appNameComponent.inputEl);

    // buttons
    new Setting(contentEl)
      .addButton(btn => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton(btn =>
        btn
          .setButtonText('Publish')
          .setCta()
          .onClick(() => this.handleCallback()),
      );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

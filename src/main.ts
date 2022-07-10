import { MarkdownView, Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitClient } from './steemit-client';
import { SubmitConfirmModal } from './submit_confirm_modal';
import { SteemitFrontMatter, SteemitPluginSettings, SteemitPost } from './types';

import {
  addFrontMatter,
  toStringFrontMatter,
  addDataToFrontMater,
  frontMaterToString,
  stripFrontmatter,
} from './utils';

export default class SteemitPlugin extends Plugin {
  settings?: SteemitPluginSettings;

  async onload() {
    console.info('loading obsidian-steemit plugin');

    await this.loadSettings();

    this.addRibbonIcon('dice', 'Publish to Steemit', (evt: MouseEvent) => {
      this.publishSteemit();
    });
    // this.addRibbonIcon('dice', 'Import from url', (evt: MouseEvent) => {
    //   this.scrapSteemit();
    // });

    this.addCommand({
      id: 'obsidian-steemit-publish',
      name: 'Publish to Steemit',
      callback: () => {
        this.publishSteemit();
      },
    });

    this.addCommand({
      id: 'obsidian-steemit-import-from-url',
      name: 'Import from url',
      callback: async () => {
        this.scrapSteemit();
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SteemitSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async scrapSteemit() {
    try {
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!activeView) {
        throw new Error('There is no editor view found.');
      }

      const frontMatter = this.app.metadataCache.getFileCache(activeView.file)?.frontmatter;
      if (!frontMatter) {
        throw new Error('Front Matter not found. expect a url.');
      }

      let username = this.settings?.username ?? '';
      let permlink = frontMatter.permlink;
      const url = frontMatter.url;
      if (url) {
        const urls = url.replace(/\?.*$/, '').split('/');
        permlink = urls.pop();
        username = urls.pop()?.replace(/^@/, '');
      }

      const client = new SteemitClient('', '');
      const response = await client.getPost(username, permlink);
      const jsonMetadata = JSON.parse(response.json_metadata || '{}');
      const newFrontMatter = addFrontMatter(frontMatter, {
        category: response.category,
        title: response.title,
        permlink: response.permlink,
        tags: jsonMetadata.tags,
      });
      const frontMatterString = toStringFrontMatter(newFrontMatter);
      const fileContent = `${frontMatterString}\n${response.body}`;
      await this.app.vault.modify(activeView.file, fileContent);
    } catch (ex: any) {
      console.warn(ex);
      new Notice(ex.toString());
    }
  }

  async publishSteemit() {
    try {
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!activeView) {
        throw new Error('There is no editor view found.');
      }

      // open confirm modal popup
      new SubmitConfirmModal(this, async (result, response) => {
        try {
          await this.updateFileContent(result);

          new Notice(`Post published successfully! ${response.id}`);
        } catch (ex: any) {
          console.warn(ex);
          new Notice(ex.toString());
        }
      }).open();
    } catch (e: any) {
      new Notice(e.toString());
    }
  }

  async updateFileContent(result: SteemitPost) {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      const fileContent = await this.app.vault.cachedRead(activeView.file);
      const frontMatter = (this.app.metadataCache.getFileCache(activeView.file)?.frontmatter ||
        {}) as SteemitFrontMatter;

      const contentBody = stripFrontmatter(fileContent);
      const newFrontMatter = frontMaterToString(addDataToFrontMater(frontMatter, result));

      const newFileContent = `${newFrontMatter}\n${contentBody}`;

      await this.app.vault.modify(activeView.file, newFileContent);
    }
  }
}

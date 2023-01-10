/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkdownView, Notice, Plugin, stringifyYaml, TFile } from 'obsidian';

import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitClient } from './steemit-client';
import { SubmitConfirmModal } from './ui/submit_confirm_modal';
import { SteemitPluginSettings, SteemitPost } from './types';
import { getActiveView, getCachedFrontmatter, parseFrontmatter, parsePostData } from './utils';

export default class SteemitPlugin extends Plugin {
  #settings?: SteemitPluginSettings;
  client?: SteemitClient;

  get settings() {
    return this.#settings;
  }

  async onload() {
    console.info('loading obsidian-steemit plugin');

    await this.loadSettings();

    this.addCommand({
      id: 'obsidian-steemit-publish',
      name: 'Publish to Steemit',
      callback: () => this.publishSteemit(),
    });
    this.addCommand({
      id: 'obsidian-steemit-import-from-url',
      name: 'Import from url',
      callback: () => this.scrapSteemit(),
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SteemitSettingTab(this.app, this));

    this.client = new SteemitClient(this.settings?.username, this.settings?.password);
  }

  async loadSettings() {
    this.#settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.#settings);
  }

  async scrapSteemit() {
    try {
      const { file } = getActiveView();
      const cachedFrontmatter = getCachedFrontmatter(file);
      const url = cachedFrontmatter?.url;
      if (!url) {
        throw new Error('Front Matter not found. expect a url.');
      }
      const [, , username, permlink] = new URL(cachedFrontmatter.url).pathname.split('/');
      const res = await new SteemitClient().getPost(username.slice(1), permlink);
      const metadata = JSON.parse(res.json_metadata || '{}');
      const newFrontmatter = stringifyYaml({
        ...cachedFrontmatter,
        category: res.category,
        title: res.title,
        permlink: res.permlink,
        tags: metadata.tags,
      });
      const fileContent = `---\n${newFrontmatter}---\n${res.body}`;
      await this.app.vault.modify(file, fileContent);
    } catch (ex: any) {
      console.warn(ex);
      new Notice(ex.toString());
    }
  }

  validateFile(file: TFile) {
    const metadataCache = this.app.metadataCache.getFileCache(file);
    if (
      metadataCache?.sections?.findIndex(({ type }) => type === 'yaml') !== -1 &&
      !metadataCache?.frontmatter
    ) {
      throw new Error('Invalid YAML');
    }
    return true;
  }

  getActiveView() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      throw new Error('There is no editor view found.');
    }
    return activeView;
  }

  getCachedFrontmatter(file: TFile) {
    const frontmatter = { ...this.app.metadataCache.getFileCache(file)?.frontmatter };
    delete frontmatter['position'];
    return frontmatter as Record<string, string>;
  }

  async publishSteemit() {
    try {
      // check username and password
      if (!this.settings || !this.settings.username || !this.settings.password) {
        throw Error('Your steemit username or password is invalid.');
      }
      this.client = new SteemitClient(this.settings.username, this.settings.password);

      const data = parsePostData();
      if (!data.body) {
        throw new Error('Content is empty.');
      }

      new SubmitConfirmModal(this, data, async (post, postOptions) => {
        if (this.client) {
          try {
            const response = await this.client.newPost(post, postOptions);
            await this.updateFileContent(post);
            new Notice(`Post published successfully! ${response.id}`);
          } catch (ex: any) {
            console.warn(ex);
            new Notice(ex.toString());
          }
        }
      }).open();
    } catch (e: any) {
      new Notice(e.toString());
    }
  }

  async updateFileContent(post: SteemitPost) {
    const activeView = getActiveView();
    const frontMatter = stringifyYaml({
      ...parseFrontmatter(activeView.data),
      category: post.category === '0' ? '' : post.category,
      title: post.title,
      permlink: post.permlink,
      tags: post.tags,
    });
    await this.app.vault.modify(activeView.file, `---\n${frontMatter}---\n${post.body}`);
  }
}

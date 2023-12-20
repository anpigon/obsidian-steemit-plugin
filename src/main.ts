/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FrontMatterCache, MarkdownView, Notice, Plugin, stringifyYaml, TFile } from 'obsidian';

import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitClient } from './steemit-client';
import { SteemitPluginSettings, SteemitPost } from './types';
import { SubmitConfirmModal } from './ui/submit_confirm_modal';
import { makeDefaultPermlink, removeObsidianComments, stripFrontmatter } from './utils';
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
      const activeView = this.getActiveView();
      if (!activeView || !activeView.file) {
        throw new Error('There is no active file.');
      }

      const frontmatter = await this.processFrontMatter(activeView.file);
      const url = frontmatter?.url;
      if (!url) {
        throw new Error('Front Matter not found. expect a url.');
      }

      const [, , username, permlink] = new URL(frontmatter.url).pathname.split('/');
      const res = await new SteemitClient().getPost(username.slice(1), permlink);
      const metadata = JSON.parse(res.json_metadata || '{}');
      const newFrontmatter = stringifyYaml({
        ...frontmatter,
        category: res.category,
        title: res.title,
        permlink: res.permlink,
        tags: metadata.tags,
      });
      const fileContent = `---\n${newFrontmatter}---\n${res.body}`;

      await this.app.vault.modify(activeView.file, fileContent);
    } catch (ex: any) {
      console.warn(ex);
      new Notice(ex.toString());
    }
  }

  async processFrontMatter(file: TFile): Promise<FrontMatterCache> {
    return new Promise(resolve => this.app.fileManager.processFrontMatter(file, resolve));
  }

  async parsePostData(file: TFile): Promise<SteemitPost> {
    const fileContent = await this.app.vault.read(file);
    const frontMatter = await this.processFrontMatter(file);
    return {
      category: frontMatter?.category?.toString() || '',
      permlink: frontMatter?.permlink?.toString() || makeDefaultPermlink(),
      title: frontMatter?.title?.toString() || file.basename,
      tags: frontMatter?.tags?.toString() || '',
      body: removeObsidianComments(stripFrontmatter(fileContent)),
    };
  }

  getActiveView() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      throw new Error('There is no editor view found.');
    }
    return activeView;
  }

  async publishSteemit() {
    try {
      // check username and password
      if (!this.settings || !this.settings.username || !this.settings.password) {
        throw Error('Your steemit username or password is invalid.');
      }
      this.client = new SteemitClient(this.settings.username, this.settings.password);

      const activeView = this.getActiveView();
      const post = await this.parsePostData(activeView.file!);
      if (!post.body) {
        throw new Error('Content is empty.');
      }

      new SubmitConfirmModal(this, post, async (post, postOptions) => {
        if (this.client) {
          try {
            const response = await this.client.newPost(post, postOptions);
            await this.updateFileContent(post);
            new Notice(`Post published successfully! ${response.id}`);
          } catch (e: any) {
            console.warn(e);
            new Notice(e.toString());
          }
        }
      }).open();
    } catch (e: any) {
      new Notice(e.toString());
    }
  }

  async updateFileContent(post: SteemitPost) {
    try {
      const activeView = this.getActiveView();
      if (!activeView || !activeView.file) {
        throw new Error('There is no active file.');
      }

      const frontMatter = stringifyYaml({
        ...(await this.processFrontMatter(activeView.file)),
        category: post.category === '0' ? '' : post.category,
        title: post.title,
        permlink: post.permlink,
        tags: post.tags,
      });

      await this.app.vault.modify(activeView.file, `---\n${frontMatter}---\n${post.body}`);
    } catch (ex: any) {
      console.warn(ex);
      new Notice(ex.toString());
    }
  }
}

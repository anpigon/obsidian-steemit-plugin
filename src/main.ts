/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLinkpath, MarkdownView, Notice, Plugin, stringifyYaml, TFile } from 'obsidian';

import { Publisher } from './helpers/publisher';
import { SteemitClient } from './helpers/steemit-client';
import { createNewFrontMatter, extractContentBody } from './helpers/utils';
import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitPluginSettings, SteemitPost, SteemitPostOptions } from './types';
import { SubmitConfirmModal } from './ui/submit_confirm_modal';
export default class SteemitPlugin extends Plugin {
  private _settings?: SteemitPluginSettings;
  readonly appName = `${this.manifest.id}/${this.manifest.version}`;
  client?: SteemitClient;

  get settings() {
    return this._settings;
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

    this.client = new SteemitClient(this.settings?.username, this.settings?.password, this.appName);
  }

  async loadSettings() {
    this._settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this._settings);
  }

  async scrapSteemit() {
    try {
      const file = this.getActiveViewFile();

      const frontmatter = await new Publisher(this).processFrontMatter(file);
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

      await this.app.vault.modify(file, fileContent);
    } catch (ex: any) {
      console.warn(ex);
      new Notice(ex.toString());
    }
  }

  getActiveViewFile() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView?.file) {
      throw new Error('There is no editor view found.');
    }
    return activeView.file;
  }

  async publishSteemit() {
    try {
      // check username and password
      if (!this.settings || !this.settings.username || !this.settings.password) {
        throw Error('Your steemit username or password is invalid.');
      }

      const file = this.getActiveViewFile();

      const post = await new Publisher(this).generate(file);
      if (!post.body) {
        throw new Error('Content is empty.');
      }

      this.client = new SteemitClient(this.settings.username, this.settings.password);
      new SubmitConfirmModal(this, post, async (post, postOptions) => {
        await this.publishAndUpdate(post, postOptions, file);
      }).open();
    } catch (e: any) {
      new Notice(e.toString());
    }
  }

  async publishAndUpdate(post: SteemitPost, postOptions: SteemitPostOptions, file: TFile) {
    if (this.client) {
      try {
        const response = await this.client.publishPost(post, postOptions);
        await this.updateFileContent(post, file);
        new Notice(`Post published successfully! ${response.id}`);
      } catch (err: any) {
        console.warn(err);
        new Notice(err.toString());
      }
    }
  }

  async updateFileContent(post: SteemitPost, file: TFile) {
    const fileContent = await this.app.vault.read(file);
    const frontMatter = await new Publisher(this).processFrontMatter(file);
    const contentBody = extractContentBody(fileContent);
    const newFrontMatter = createNewFrontMatter(frontMatter, {
      category: post.category,
      title: post.title,
      permlink: post.permlink,
      tags: post.tags,
    });

    const newFileContent = `---\n${stringifyYaml(newFrontMatter)}---\n${contentBody}`;
    return await this.app.vault.modify(file, newFileContent);
  }
}

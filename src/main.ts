/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkdownView, Notice, Plugin, stringifyYaml, TFile } from 'obsidian';

import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitClient } from './steemit-client';
import { SubmitConfirmModal } from './ui/submit_confirm_modal';
import { SteemitPluginSettings, SteemitPost } from './types';
import { parsePostData, stripFrontmatter } from './utils';

export default class SteemitPlugin extends Plugin {
  #settings?: SteemitPluginSettings;

  get settings() {
    return this.#settings;
  }

  async onload() {
    console.info('loading obsidian-steemit plugin');

    await this.loadSettings();

    this.addCommand({
      id: 'obsidian-steemit-publish',
      name: 'Publish to Steemit',
      editorCallback: (_, view) => this.publishSteemit(view),
    });
    this.addCommand({
      id: 'obsidian-steemit-import-from-url',
      name: 'Import from url',
      editorCallback: (_, view) => this.scrapSteemit(view),
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SteemitSettingTab(this.app, this));
  }

  async loadSettings() {
    this.#settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.#settings);
  }

  async scrapSteemit({ file }: MarkdownView) {
    try {
      const cachedFrontmatter = this.getCachedFrontmatter(file);
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

  async publishSteemit(activeView: MarkdownView) {
    try {
      await activeView.save();
      const postData = parsePostData(activeView);
      new SubmitConfirmModal(this, postData, async (postData, response) => {
        try {
          await this.updateFileContent(postData);
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

  async updateFileContent(steemitPost: SteemitPost) {
    const { file } = this.getActiveView();
    const frontMatter = {
      ...this.getCachedFrontmatter(file),
      category: steemitPost.category || 'steemit',
      title: steemitPost.title,
      permlink: steemitPost.permlink,
      tags: steemitPost.tags,
    };
    const content = stripFrontmatter(await this.app.vault.cachedRead(file));
    await this.app.vault.modify(file, `---\n${stringifyYaml(frontMatter)}---\n${content}`);
  }
}

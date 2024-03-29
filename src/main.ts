/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FrontMatterCache,
  getLinkpath,
  MarkdownView,
  Notice,
  Plugin,
  stringifyYaml,
  TFile,
} from 'obsidian';

import { DEFAULT_SETTINGS, SteemitSettingTab } from './settings';
import { SteemitClient } from './helpers/steemit-client';
import { SteemitPluginSettings, SteemitPost, SteemitPostOptions } from './types';
import { SubmitConfirmModal } from './ui/submit_confirm_modal';
import {
  createNewFrontMatter,
  extractContentBody,
  makeDefaultPermlink,
  removeObsidianComments,
  stripFrontmatter,
} from './helpers/utils';
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
    const body = await this.renderLinksToFullPath(
      removeObsidianComments(stripFrontmatter(fileContent)),
      file.path,
    );
    return {
      category: frontMatter?.category?.toString() || '',
      permlink: frontMatter?.permlink?.toString() || makeDefaultPermlink(),
      title: frontMatter?.title?.toString() || file.basename,
      tags: frontMatter?.tags?.toString() || '',
      body,
    };
  }

  async renderLinksToFullPath(text: string, filePath: string): Promise<string> {
    let result = text.toString();

    const linkedFileRegex = /\[\[(.*?)\]\]/g;
    const linkedFileMatches = result.match(linkedFileRegex);

    if (linkedFileMatches) {
      for (const linkMatch of linkedFileMatches) {
        try {
          const textInsideBrackets = linkMatch.substring(
            linkMatch.indexOf('[') + 2,
            linkMatch.lastIndexOf(']') - 1,
          );
          let [linkedFileName, prettyName] = textInsideBrackets.split('|');

          prettyName = prettyName || linkedFileName;
          if (linkedFileName.includes('#')) {
            const headerSplit = linkedFileName.split('#');
            linkedFileName = headerSplit[0];
          }
          const linkedFile = this.app.metadataCache.getFirstLinkpathDest(
            getLinkpath(linkedFileName),
            filePath,
          );
          if (!linkedFile) {
            // 내부 파일 링크가 없는 경우 prettyName만 표시한다.
            result = result.replace(linkMatch, prettyName);
          }
          if (linkedFile?.extension === 'md') {
            const frontmatter = this.app.metadataCache.getFileCache(linkedFile)?.frontmatter;
            if (frontmatter && 'permlink' in frontmatter) {
              const { permlink, title } = frontmatter;
              result = result.replace(
                linkMatch,
                `[${title || prettyName}](/@${this.settings?.username ?? ''}/${permlink})`,
              );
            } else {
              // 내부 파일 링크가 tistoryPostUrl이 없는 경우 prettyName만 표시한다.
              result = result.replace(linkMatch, prettyName);
            }
          }
        } catch (e) {
          console.log(e);
          continue;
        }
      }
    }

    return result;
  }

  getActiveView() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView || !activeView.file) {
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
      const file = activeView.file;
      if (!file) {
        throw new Error('There is no active file.');
      }

      const post = await this.parsePostData(file);
      if (!post.body) {
        throw new Error('Content is empty.');
      }

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
    const frontMatter = await this.processFrontMatter(file);
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

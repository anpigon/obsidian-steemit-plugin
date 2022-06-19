import { Client } from 'dsteem/lib/client';
import { PrivateKey } from 'dsteem/lib/crypto';
import { App, MarkdownView, Notice, parseFrontMatterTags } from 'obsidian';

import SteemitPlugin from './main';
import { SteemitFrontMatter, SteemitJsonMetadata } from './types';
import { addFrontMatter, toStringFrontMatter } from './utils';

export class SteemitClient {
  constructor(
    private readonly app: App,
    private readonly plugin: SteemitPlugin,
  ) {
    this.client = new Client('https://api.steemit.com');
  }

  readonly client: Client;

  async getPost() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      try {
        const frontMatter = this.app.metadataCache.getFileCache(activeView.file)
          ?.frontmatter as SteemitFrontMatter;
        if (!frontMatter) {
          new Notice('Front Matter not found. expect a url.');
          return;
        }

        let author = this.plugin.settings?.username;
        let permlink = frontMatter.permlink;

        const url = frontMatter.url;
        if (url) {
          const urls = url.replace(/\?.*$/, '').split('/');
          permlink = urls.pop();
          author = urls.pop()?.replace(/^@/, '');
        }

        const response = await this.client.database.call('get_content', [
          author,
          permlink,
        ]);
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
    } else {
      new Notice('There is no editor view found.');
    }
  }

  async newPost() {
    const { workspace } = this.app;
    const activeView = workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      try {
        const fileContent = await this.app.vault.cachedRead(activeView.file);
        const frontMatter = this.app.metadataCache.getFileCache(activeView.file)
          ?.frontmatter as SteemitFrontMatter;
        if (!frontMatter) {
          new Notice('Please write frontmatter.');
          return;
        }

        const tags = parseFrontMatterTags(frontMatter)?.map(tag =>
          tag.replace(/^#/, '').trim(),
        );
        const title = frontMatter?.title || activeView.file.basename;
        const permlink =
          frontMatter?.permlink ||
          new Date()
            .toISOString()
            .replace(/[^\w]+/g, '')
            .toLowerCase();

        const { username, password } = this.plugin.settings || {};
        if (!username || !password) {
          throw Error('Your account is invalid.');
        }

        const category =
          frontMatter?.category ||
          this.plugin.settings?.category ||
          tags?.[0] ||
          'kr';

        // Strip front-matter and HTML comments
        const parsedContent = fileContent
          .slice(frontMatter.position.end.offset)
          .replace(/^<!--.*-->$/ms, '')
          .trim();

        const appName =
          this.plugin.settings?.appName ||
          `${this.plugin.manifest.id}/${this.plugin.manifest.version}`;
        const jsonMetadata: SteemitJsonMetadata = {
          format: 'markdown',
          app: appName,
        };
        if (tags && tags.length) {
          jsonMetadata['tags'] = tags;
        }
        const data = {
          parent_author: '', // Leave parent author empty
          parent_permlink: category, // Main tag
          author: username, // Author
          permlink: permlink, // Permlink
          title: title, // Title
          body: parsedContent, // Body
          json_metadata: JSON.stringify(jsonMetadata), // Json Meta
        };

        const response = await this.client.broadcast.comment(
          data,
          PrivateKey.fromString(password),
        );

        await this.app.vault.modify(
          activeView.file,
          fileContent.replace(/^(permlink:).*$/m, `$1 ${permlink}`),
        );

        new Notice(`Post published successfully! ${response.id}`);
      } catch (ex: any) {
        console.warn(ex);
        new Notice(ex.toString());
      }
    } else {
      new Notice('There is no editor found. Nothing will be published.');
    }
  }
}

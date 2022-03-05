import { broadcast } from 'steem';
import parserFrontMatter from 'front-matter';
import { App, MarkdownView, Notice, parseFrontMatterTags } from 'obsidian';

import SteemitPlugin from './main';
import { SteemitFrontMatter, SteemitJsonMetadata } from './types';

export class SteemitClient {
  constructor(
    private readonly app: App,
    private readonly plugin: SteemitPlugin,
  ) {}

  async newPost() {
    const { workspace } = this.app;
    const activeView = workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      try {
        const content = await this.app.vault.read(activeView.file);
        const frontMatter: SteemitFrontMatter = parserFrontMatter(content)
          .attributes as SteemitFrontMatter;

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

        const { username, password } = this.plugin.settings!;

        const category =
          frontMatter?.category ||
          this.plugin.settings!.category ||
          tags?.[0] ||
          'kr';

        // Strip front-matter and HTML comments
        const parsedContent = content
          .replace(/^---$.*^---$/ms, '')
          .replace(/^<!--.*-->$/ms, '')
          .trim();

        const jsonMetadata: SteemitJsonMetadata = {
          app: `${this.plugin.manifest.id}/${this.plugin.manifest.version}`,
        };
        if (tags && tags.length) {
          jsonMetadata['tags'] = tags;
        }

        const response = await broadcast.commentAsync(
          password,
          '', // Leave parent author empty
          category, // Main tag
          username, // Author
          permlink, // Permlink
          title, // Title
          parsedContent, // Body
          jsonMetadata, // Json Meta
        );

        new Notice('Post published successfully!');
      } catch (ex: any) {
        console.warn(ex);
        new Notice(ex.toString());
      }
    } else {
      const error = 'There is no editor found. Nothing will be published.';
      console.warn(error);
      new Notice(error.toString());
    }
  }
}

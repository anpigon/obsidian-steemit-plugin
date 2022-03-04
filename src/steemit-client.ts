import { broadcast } from 'steem';
import parserFrontMatter from 'front-matter';
import { App, MarkdownView, Notice, parseFrontMatterTags } from 'obsidian';

import SteemitPlugin from './main';
import { SteemitFrontMatter } from './types';

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
        const frontMatter: SteemitFrontMatter =
          parserFrontMatter(content).attributes;

        const tags = parseFrontMatterTags(frontMatter);
        const title = frontMatter?.title || activeView.file.basename;
        const permlink =
          frontMatter?.permlink ||
          new Date()
            .toISOString()
            .replace(/[^a-zA-Z0-9]+/g, '')
            .toLowerCase();
        const category = frontMatter?.category || this.plugin.settings.category;
        const { username, password } = this.plugin.settings;

        // Strip front-matter and HTML comments
        const parsedContent = content
          .replace(/^---$.*^---$/ms, '')
          .replace(/^<!--.*-->$/ms, '')
          .trim();

        const response = await broadcast.commentAsync(
          password,
          '', // Leave parent author empty
          category, // Main tag
          username, // Author
          permlink, // Permlink
          title, // Title
          parsedContent, // Body
          {
            tags: tags,
            app: `${this.plugin.manifest.id}/${this.plugin.manifest.version}`,
          }, // Json Meta
        );
        console.log(response);

        new Notice('Post published successfully!');
      } catch (ex) {
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

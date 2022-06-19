import { App, MarkdownView, parseFrontMatterTags } from 'obsidian';
import SteemitPlugin from './main';
import { SteemitFrontMatter, SteemitPost } from './types';

export async function getPostDataFromActiveView(plugin: SteemitPlugin): Promise<SteemitPost> {
  const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  if (!activeView) {
    const error = 'There is no editor found. Nothing will be published.';
    throw new Error(error);
  }

  const fileContent = await plugin.app.vault.cachedRead(activeView.file);
  const frontMatter = plugin.app.metadataCache.getFileCache(activeView.file)
    ?.frontmatter as SteemitFrontMatter;
  if (!frontMatter) {
    throw new Error('Please write frontmatter.');
  }

  const title = frontMatter?.title || activeView.file.basename;

  // Strip front-matter and HTML comments
  const body = fileContent
    .slice(frontMatter.position.end.offset)
    .replace(/^<!--.*-->$/ms, '')
    .trim();

  const tags =
    parseFrontMatterTags(frontMatter)
      ?.map(tag => tag.replace(/^#/, '').trim())
      .join(' ') ?? '';

  const permlink =
    frontMatter?.permlink ||
    new Date()
      .toISOString()
      .replace(/[^\w]+/g, '')
      .toLowerCase();

  const category = frontMatter?.category;

  return {
    category,
    permlink,
    title,
    body,
    tags,
  };
}

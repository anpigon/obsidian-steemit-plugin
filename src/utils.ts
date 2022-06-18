import { App, MarkdownView, parseFrontMatterTags } from 'obsidian';
import { SteemitFrontMatter, SteemitPost } from './types';

export async function getPostDataFromActiveView(app: App, activeView: MarkdownView): Promise<SteemitPost> {
  const fileContent = await app.vault.cachedRead(activeView.file);
  const frontMatter = app.metadataCache.getFileCache(activeView.file)?.frontmatter as SteemitFrontMatter;
  if (!frontMatter) {
    throw new Error('Please write frontmatter.');
  }

  const title = frontMatter?.title || activeView.file.basename;

  // Strip front-matter and HTML comments
  const body = fileContent
    .slice(frontMatter.position.end.offset)
    .replace(/^<!--.*-->$/ms, '')
    .trim();

  const tags = parseFrontMatterTags(frontMatter)?.map(tag => tag.replace(/^#/, '').trim()).join(' ');

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

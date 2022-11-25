import { MarkdownView, parseFrontMatterTags } from 'obsidian';
import SteemitPlugin from './main';
import { SteemitFrontMatter, SteemitPost } from './types';

export const frontmatterRegex = /^---\n(?:((?!---)(.|\n)*?)\n)?---(\n|$)/;

export function parseFrontMatter(content: string): SteemitFrontMatter | undefined {
  if (!frontmatterRegex.test(content)) {
    return;
  }
  return frontmatterRegex
    .exec(content)?.[1]
    ?.split('\n')
    .reduce<SteemitFrontMatter>((acc, x) => {
      const [key, value] = x.split(':');
      return (acc[key?.trim()] = value?.trim()), acc;
    }, {} as SteemitFrontMatter);
}

export async function parsePostData(plugin: SteemitPlugin): Promise<SteemitPost> {
  const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  if (!activeView) {
    const error = 'There is no editor found. Nothing will be published.';
    throw new Error(error);
  }

  const fileContent = await plugin.app.vault.cachedRead(activeView.file);

  // Strip front-matter and HTML comments
  const body = removeObsidianComments(stripFrontmatter(fileContent));

  // parse front-matter
  const frontMatter = (plugin.app.metadataCache.getFileCache(activeView.file)?.frontmatter ??
    parseFrontMatter(fileContent)) as SteemitFrontMatter;

  const title = frontMatter?.title || activeView.file.basename;
  const permlink = frontMatter?.permlink || makeDefaultPermlink();
  const category = frontMatter?.category || plugin.settings?.category || '';
  const appName = plugin.settings?.appName || `${plugin.manifest.id}/${plugin.manifest.version}`;
  const tags =
    parseFrontMatterTags(frontMatter)
      ?.map(tag => tag.replace(/^#/, '').trim())
      .join(' ') ?? '';

  return {
    appName,
    category,
    permlink,
    title,
    body,
    tags,
  };
}

function makeDefaultPermlink() {
  return new Date()
    .toISOString()
    .replace(/[^\w]+/g, '')
    .toLowerCase();
}

export function stripFrontmatter(content: string) {
  return content.trimStart().replace(frontmatterRegex, '');
}

export function removeObsidianComments(content: string) {
  return content.replace(/^\n?%%(.+?)%%\n?$/gms, '');
}

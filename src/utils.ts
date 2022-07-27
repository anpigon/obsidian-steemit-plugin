import { MarkdownView, parseFrontMatterTags, TFile } from 'obsidian';
import SteemitPlugin from './main';
import { SteemitFrontMatter, SteemitPost } from './types';

export const frontmatterRegex = /^---\n(?:((?!---)(.|\n)*?)\n)?---(\n|$)/;

export function parseFrontMatter(content: string): SteemitFrontMatter | null {
  if (!frontmatterRegex.test(content)) {
    return null;
  }
  const extractedFrontMatter = frontmatterRegex.exec(content);
  const result =
    extractedFrontMatter?.[1].split('\n').reduce<SteemitFrontMatter>((acc, x) => {
      const [key, value] = x.split(':');
      return (acc[key?.trim()] = value?.trim()), acc;
    }, {} as SteemitFrontMatter) ?? null;
  return result;
}

export function toStringFrontMatter(frontMatter: SteemitFrontMatter): string {
  const frontMatterString = Object.entries(frontMatter)
    .filter(([key]) => key !== 'position')
    .map(([key, value]) => `${key}: ${value ?? ''}`)
    .join('\n');
  return `---\n${frontMatterString}\n---`;
}

export function addFrontMatter(
  oldFrontMatter: SteemitFrontMatter,
  {
    category,
    title,
    permlink,
    tags,
  }: Partial<Pick<SteemitFrontMatter, 'category' | 'title' | 'permlink' | 'tags'>>,
): SteemitFrontMatter {
  const newFrontMatter = Object.assign({}, oldFrontMatter);

  const frontMatterKeysForSteemit = ['category', 'permlink', 'title', 'tags'];
  frontMatterKeysForSteemit.forEach(key => {
    if (!newFrontMatter.hasOwnProperty(key)) {
      newFrontMatter[key] = '';
    }
  });

  newFrontMatter.category = category;
  newFrontMatter.title = title;
  newFrontMatter.permlink = permlink;
  newFrontMatter.tags = tags;
  return newFrontMatter;
}

export async function getPostDataFromActiveView(plugin: SteemitPlugin): Promise<SteemitPost> {
  const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  if (!activeView) {
    const error = 'There is no editor found. Nothing will be published.';
    throw new Error(error);
  }

  const fileContent = await plugin.app.vault.cachedRead(activeView.file);
  const frontMatterCache = plugin.app.metadataCache.getFileCache(activeView.file)
    ?.frontmatter as SteemitFrontMatter;
  const frontMatter = frontMatterCache ?? parseFrontMatter(fileContent);

  const title = frontMatter?.title || activeView.file.basename;

  // Strip front-matter and HTML comments
  const body = fileContent
    .slice(frontMatter?.position?.end?.offset ?? 0)
    .replace(/^<!--.*-->$/ms, '')
    .trim();

  const tags =
    parseFrontMatterTags(frontMatter)
      ?.map(tag => tag.replace(/^#/, '').trim())
      .join(' ') ?? '';

  const permlink = frontMatter?.permlink || makeDefaultPermlink();
  const category = frontMatter?.category || plugin.settings?.category || '';
  const appName = plugin.settings?.appName || `${plugin.manifest.id}/${plugin.manifest.version}`;

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

export function addDataToFrontMater(frontmatter: SteemitFrontMatter, data: SteemitPost) {
  return {
    title: data.title ?? frontmatter.title ?? '',
    permlink: data.permlink ?? frontmatter.permlink ?? '',
    tags: data.tags.split(/\s|,/).map(tag => tag.trim()) ?? frontmatter.tags ?? [],
    category: data.category ?? frontmatter.category ?? '',
  } as SteemitFrontMatter;
}

export function frontMaterToString(frontmatter: SteemitFrontMatter) {
  const frontMaterString = Object.entries(frontmatter)
    .filter(([key]) => key !== 'position')
    .map(([key, val]) => {
      if (key === 'tags' && Array.isArray(val)) {
        return `tags: ${val.join(' ')}`;
      }
      return `${key}: ${val ?? ''}`;
    })
    .join('\n');
  return `---\n${frontMaterString}\n---`;
}

export function stripFrontmatter(content: string) {
  return content.trimStart().replace(frontmatterRegex, '');
}

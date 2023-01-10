import { MarkdownView, parseFrontMatterTags, TFile, parseYaml } from 'obsidian';
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

export function getActiveView() {
  const activeView = app.workspace.getActiveViewOfType(MarkdownView);
  if (!activeView) {
    throw new Error('There is no editor view found.');
  }
  return activeView;
}

export function getCachedFrontmatter<T = Record<string, string>>(file: TFile) {
  const frontmatter = { ...app.metadataCache.getFileCache(file)?.frontmatter };
  delete frontmatter['position'];
  return frontmatter as T;
}

export function parsePostData(): SteemitPost {
  const activeView = getActiveView();
  const frontMatter = parseFrontmatter(activeView.data);
  return {
    category: frontMatter?.category?.toString() || '',
    permlink: frontMatter?.permlink?.toString() || makeDefaultPermlink(),
    title: frontMatter?.title?.toString() || activeView.file.basename,
    tags: frontMatter?.tags?.toString() || '',
    body: removeObsidianComments(stripFrontmatter(activeView.data)),
  };
}

function makeDefaultPermlink() {
  return new Date()
    .toISOString()
    .replace(/[^\w]+/g, '')
    .toLowerCase();
}

export function parseFrontmatter(content: string) {
  const results = parseYaml(content.split('---')?.[1] ?? '');
  const tags = parseFrontMatterTags(results)
    ?.map(tag => tag.replace(/^#/, '').trim())
    .join(' ');
  return { ...results, tags };
}

export function stripFrontmatter(content: string) {
  return content.trimStart().replace(frontmatterRegex, '');
}

export function removeObsidianComments(content: string) {
  return content.replace(/^\n?%%(.+?)%%\n?$/gms, '');
}

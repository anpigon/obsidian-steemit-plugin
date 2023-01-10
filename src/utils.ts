import { MarkdownView, parseFrontMatterTags } from 'obsidian';
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

export function parsePostData(activeView: MarkdownView): SteemitPost {
  const fileContent = activeView.data;
  const body = removeObsidianComments(stripFrontmatter(fileContent));
  const frontMatter = parseFrontMatter(fileContent);

  const title = frontMatter?.title?.toString() || activeView.file.basename;
  const permlink = frontMatter?.permlink?.toString() || makeDefaultPermlink();
  const category = frontMatter?.category?.toString() || '';
  const tags =
    parseFrontMatterTags(frontMatter)
      ?.map(tag => tag.replace(/^#/, '').trim())
      .join(' ') ?? '';

  return {
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

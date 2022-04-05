import { SteemitFrontMatter } from './types';

export default {};

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
  }: Partial<
    Pick<SteemitFrontMatter, 'category' | 'title' | 'permlink' | 'tags'>
  >,
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

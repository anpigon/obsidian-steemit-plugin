import { FrontMatterCache } from 'obsidian';

export const frontmatterRegex = /^---\n(?:((?!---)(.|\n)*?)\n)?---(\n|$)/;

export function makeDefaultPermlink() {
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

export const removeFrontmatter = (markdownContent: string) => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = markdownContent.match(frontmatterRegex);

  if (match) {
    // Extract frontmatter and remove it from the content
    const frontmatterString = match[0];
    const contentWithoutFrontmatter = markdownContent.replace(frontmatterRegex, '');

    return { frontmatterString, contentWithoutFrontmatter };
  } else {
    // No frontmatter found
    return { frontmatterString: '', contentWithoutFrontmatter: markdownContent };
  }
};

// 파일 내용에서 프론트매터를 제거하는 함수
export const extractContentBody = (fileContent: string): string => {
  const { contentWithoutFrontmatter } = removeFrontmatter(fileContent);
  return contentWithoutFrontmatter;
};

// 새로운 프론트매터를 생성하는 함수
export const createNewFrontMatter = (
  existingFrontMatter: FrontMatterCache,
  additions: FrontMatterCache,
): FrontMatterCache => {
  const newFrontMatter = { ...existingFrontMatter, ...additions };
  // 값이 없는 키 삭제
  Object.entries(newFrontMatter).forEach(([key, value]) => {
    if (!value) {
      delete newFrontMatter[key];
    }
  });
  return newFrontMatter;
};

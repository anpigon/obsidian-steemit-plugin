/* eslint-disable no-console */
import { FrontMatterCache, Notice, TFile, getLinkpath } from 'obsidian';
import SteemitPlugin from 'src/main';
import { makeDefaultPermlink, removeObsidianComments, stripFrontmatter } from './utils';
import { SteemitPost } from 'src/types';

export class Publisher {
  constructor(private readonly plugin: SteemitPlugin) {}

  async generate(file: TFile): Promise<SteemitPost> {
    const frontMatter = await this.processFrontMatter(file);

    let body = await this.plugin.app.vault.read(file);
    body = stripFrontmatter(body);
    body = removeObsidianComments(body);
    body = await this.renderDataViews(body, file);
    body = await this.renderLinksToFullPath(body, file);

    const results = {
      category: frontMatter?.category?.toString() || '',
      permlink: frontMatter?.permlink?.toString() || makeDefaultPermlink(),
      title: frontMatter?.title?.toString() || file.basename,
      tags: frontMatter?.tags?.toString() || '',
      body,
    };
    return results;
  }

  async processFrontMatter(file: TFile): Promise<FrontMatterCache> {
    return new Promise(resolve => this.plugin.app.fileManager.processFrontMatter(file, resolve));
  }

  async renderDataViews(text: string, file: TFile) {
    const dataViewRegex = /```dataview(.+?)```/gms;
    const matches = text.matchAll(dataViewRegex);
    if (!matches) return text;

    let result = text.toString();
    for (const queryBlock of matches) {
      try {
        const block = queryBlock[0];
        const query = queryBlock[1];
        if ('DataviewAPI' in window) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const markdown = await (window as any).DataviewAPI.tryQueryMarkdown(query, file.path);
          result = result.replace(block, markdown);
        }
      } catch (err) {
        console.log(err);
        new Notice(
          'Unable to render dataview query. Please update the dataview plugin to the latest version.',
        );
      }
    }
    return result;
  }

  async renderLinksToFullPath(text: string, file: TFile): Promise<string> {
    let result = text.toString();

    const linkedFileRegex = /\[\[(.*?)\]\]/g;
    const linkedFileMatches = result.match(linkedFileRegex);

    if (linkedFileMatches) {
      for (const linkMatch of linkedFileMatches) {
        try {
          const textInsideBrackets = linkMatch.substring(
            linkMatch.indexOf('[') + 2,
            linkMatch.lastIndexOf(']') - 1,
          );
          let [linkedFileName, prettyName] = textInsideBrackets.split('|');

          prettyName = prettyName || linkedFileName;
          if (linkedFileName.includes('#')) {
            const headerSplit = linkedFileName.split('#');
            linkedFileName = headerSplit[0];
          }
          const linkedFile = this.plugin.app.metadataCache.getFirstLinkpathDest(
            getLinkpath(linkedFileName),
            file.path,
          );
          if (!linkedFile) {
            // 내부 파일 링크가 없는 경우 prettyName만 표시한다.
            result = result.replace(linkMatch, prettyName);
          }
          if (linkedFile?.extension === 'md') {
            const frontmatter = this.plugin.app.metadataCache.getFileCache(linkedFile)?.frontmatter;
            if (frontmatter && 'permlink' in frontmatter) {
              const { permlink, title, url } = frontmatter;
              if (url) {
                result = result.replace(linkMatch, `[${title || prettyName}](${url})`);
              } else {
                result = result.replace(
                  linkMatch,
                  `[${title || prettyName}](/@${this.plugin.settings?.username ?? ''}/${permlink})`,
                );
              }
            } else {
              // 내부 파일 링크가 tistoryPostUrl이 없는 경우 prettyName만 표시한다.
              result = result.replace(linkMatch, prettyName);
            }
          }
        } catch (err) {
          console.log(err);
          continue;
        }
      }
    }

    return result;
  }
}

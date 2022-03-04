declare module 'steem' {
  module broadcast {
    export function commentAsync(
      postingWif: string,
      parent_author: string,
      parent_permlink: string,
      username: string,
      permlink: string,
      title: string,
      body: string,
      json_metadata?: { tags?: string[]; app?: string },
    ): Promise<any>;
  }
}

import { request } from 'obsidian';
import { Client } from 'dsteem/lib/client';
import { PrivateKey } from 'dsteem/lib/crypto';

import { SteemitJsonMetadata, SteemitPost, SteemitRPCCommunities, SteemitRPCError } from './types';
import { CommentOperation } from 'dsteem/lib/steem/operation';

export class SteemitClient {
  private readonly client: Client;

  constructor(private readonly username: string, private readonly password: string) {
    this.client = new Client('https://api.steemit.com');
  }

  async getCommunities(observer: string) {
    const response = await request({
      url: this.client.address,
      method: 'POST',
      body: JSON.stringify({
        id: 0,
        jsonrpc: '2.0',
        method: 'bridge.list_communities',
        params: { observer, sort: 'rank' },
      }),
    });
    const json = JSON.parse(response);
    if ('error' in json) {
      const error = (json as SteemitRPCError).error;
      throw new Error(error.data ?? error.message);
    }
    return (json as SteemitRPCCommunities).result;
  }

  newPost(post: SteemitPost) {
    const jsonMetadata: SteemitJsonMetadata = {
      format: 'markdown',
      app: post.appName ?? '',
    };

    const tags = post.tags?.split(/\s|,/);
    if (tags && tags.length) {
      jsonMetadata['tags'] = tags;
    }

    const data: CommentOperation[1] = {
      parent_author: '', // Leave parent author empty
      parent_permlink: post.category || tags?.[0] || 'steemit', // Main tag
      author: this.username, // Author
      permlink: post.permlink, // Permlink
      title: post.title, // Title
      body: post.body, // Body
      json_metadata: JSON.stringify(jsonMetadata), // Json Meta
    };

    const privateKey = PrivateKey.fromString(this.password);
    return this.client.broadcast.comment(data, privateKey);
  }

  getPost(username: string, permlink: string) {
    return this.client.database.call('get_content', [username, permlink]);
  }
}

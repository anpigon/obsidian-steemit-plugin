import { request } from 'obsidian';
import { Client } from 'dsteem/lib/client';
import { PrivateKey } from 'dsteem/lib/crypto';

// import SteemitPlugin from './main';
import { SteemitJsonMetadata, SteemitPost, SteemitRPCCommunities, SteemitRPCError } from './types';

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

  async broadcast(post: SteemitPost) {
    const tags = post.tags?.split(/\s|,/);
    const category = post.category; // || tags?.[0] || 'kr';

    const jsonMetadata: SteemitJsonMetadata = {
      format: 'markdown',
      app: post.appName ?? '',
    };
    if (tags && tags.length) {
      jsonMetadata['tags'] = tags;
    }
    const data = {
      parent_author: '', // Leave parent author empty
      parent_permlink: category, // Main tag
      author: this.username, // Author
      permlink: post.permlink, // Permlink
      title: post.title, // Title
      body: post.body, // Body
      json_metadata: JSON.stringify(jsonMetadata), // Json Meta
    };

    const privateKey = PrivateKey.fromString(this.password);
    const response = await this.client.broadcast.comment(data, privateKey);
    return response;
  }
}

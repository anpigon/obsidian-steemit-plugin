import { request } from 'obsidian';
import { Client } from 'dsteem/lib/client';
import { PrivateKey } from 'dsteem/lib/crypto';

import {
  SteemitJsonMetadata,
  SteemitPost,
  SteemitRPCAllSubscriptions,
  SteemitRPCCommunities,
  SteemitRPCError,
} from './types';
import { CommentOperation, CommentOptionsOperation } from 'dsteem/lib/steem/operation';
import { getCache, setCache } from './cache';

const memcached: Record<string, unknown> = {};

export interface MyCommunity {
  name: string;
  title: string;
  role: string;
  context: string;
}

export class SteemitClient {
  private readonly client: Client;

  constructor(private readonly username: string = '', private readonly password: string = '') {
    this.client = new Client('https://api.steemit.com');
  }

  getMyCommunities() {
    const key = `getMyCommunities_${this.username}`;
    const cached = getCache<MyCommunity[]>(key);
    if (cached) {
      return cached;
    }
    return this.getAllSubscriptions(this.username).then(r => {
      const result = r?.map<MyCommunity>(([name, title, role, context]) => ({
        name,
        title,
        role,
        context,
      }));
      setCache(key, result);
      return result;
    });
  }

  // 유저가 가입한 커뮤니티 리스트 조회
  async getAllSubscriptions(account: string) {
    const body = JSON.stringify({
      id: 0,
      jsonrpc: '2.0',
      method: 'bridge.list_all_subscriptions',
      params: { account },
    });
    const response = await request({
      url: this.client.address,
      method: 'POST',
      body,
    });
    const json = JSON.parse(response);
    if ('error' in json) {
      const error = (json as SteemitRPCError).error;
      throw new Error(error.data ?? error.message);
    }
    return (json as SteemitRPCAllSubscriptions).result;
  }

  newPost(post: SteemitPost, rewardType?: '0%' | '100%' | '50%') {
    const jsonMetadata: SteemitJsonMetadata = {
      format: 'markdown',
      app: post.appName ?? '',
    };

    if (!post.category || post.category === '0') {
      post.category = '';
    }

    const tags = post.tags?.split(/\s|,/).map(tag => tag.trim());
    if (tags && tags.length) {
      jsonMetadata['tags'] = tags;
    }

    const privateKey = PrivateKey.fromString(this.password);
    const data: CommentOperation[1] = {
      parent_author: '', // Leave parent author empty
      parent_permlink: post.category || tags?.[0] || 'steemit', // Main tag
      author: this.username, // Author
      permlink: post.permlink, // Permlink
      title: post.title, // Title
      body: post.body, // Body
      json_metadata: JSON.stringify(jsonMetadata), // Json Meta
    };
    const commentOptions: CommentOptionsOperation[1] = {
      author: data.author,
      permlink: data.permlink,
      max_accepted_payout: '1000000.000 SBD',
      percent_steem_dollars: 10000,
      allow_votes: true,
      allow_curation_rewards: true,
      extensions: [],
    };

    // ref: https://github.dev/realmankwon/upvu_web/blob/ae7a8ef164d8a8ff9b4b570ca3e65d4e671165de/src/common/helper/posting.ts#L115
    switch (rewardType) {
      case '0%': // decline payout, 보상 받지않기
        commentOptions.max_accepted_payout = '0.000 SBD';
        commentOptions.percent_steem_dollars = 10000;
        break;
      case '100%': // 100% steem power payout, 100% 스팀파워로 수령
        commentOptions.max_accepted_payout = '1000000.000 SBD';
        commentOptions.percent_steem_dollars = 0; // 10000 === 100% (of 50%)
        break;
      default: // 50% steem power, 50% sd+steem, 스팀파워 50% + 스팀달러 50%로 수령
        commentOptions.max_accepted_payout = '1000000.000 SBD';
        commentOptions.percent_steem_dollars = 10000;
    }
    return this.client.broadcast.commentWithOptions(data, commentOptions, privateKey);
  }

  getPost(username: string, permlink: string) {
    return this.client.database.call('get_content', [username, permlink]);
  }
}

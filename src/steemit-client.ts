import { Client } from 'dsteem/lib/client';
import { PrivateKey } from 'dsteem/lib/crypto';
import { request } from 'obsidian';

import { CommentOperation, CommentOptionsOperation } from 'dsteem/lib/steem/operation';
import { getCache, setCache } from './cache';
import { DEFAULT_FOOTER } from './constants';
import {
  RewardType,
  SteemitJsonMetadata,
  SteemitPost,
  SteemitPostOptions,
  SteemitRPCAllSubscriptions,
  SteemitRPCError,
} from './types';

const safeStorage = window.electron?.remote.safeStorage;

export interface MyCommunity {
  name: string;
  title: string;
  role: string;
  context: string;
}

const STEEM_RPC_SERVER_LIST = ['https://api.steemit.com'];

export class SteemitClient {
  private readonly client: Client;

  constructor(
    private readonly username: string = '',
    private readonly password: string = '',
  ) {
    this.client = this.initializeClient();
  }

  private initializeClient(): Client {
    return new Client(STEEM_RPC_SERVER_LIST[0]);
  }

  async getMyCommunities() {
    const key = `getMyCommunities`;
    const cached = getCache<MyCommunity[]>(key);
    if (cached) return cached;

    const communities = await this.getAllSubscriptions(this.username);
    setCache(key, communities);
    return communities;
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
    const { result } = json as SteemitRPCAllSubscriptions;
    return result?.map<MyCommunity>(([name, title, role, context]) => ({
      name,
      title,
      role,
      context,
    }));
  }

  createTags(post: SteemitPost): string[] | undefined {
    return post.tags?.split(/\s|,/).map(tag => tag.trim());
  }

  appendDefaultFooter({ body }: SteemitPost): string {
    if (!body.contains(DEFAULT_FOOTER)) body += `\n\n${DEFAULT_FOOTER}`;
    // eslint-disable-next-line no-control-regex
    return body.replace(/\x08/g, '');
  }

  publishPost(post: SteemitPost, { appName, rewardType }: SteemitPostOptions) {
    const jsonMetadata: SteemitJsonMetadata = {
      format: 'markdown',
      app: appName,
    };

    const tags = this.createTags(post);
    if (tags && tags.length) {
      jsonMetadata['tags'] = tags;
    }

    const body = this.appendDefaultFooter(post);

    const data: CommentOperation[1] = {
      parent_author: '', // Leave parent author empty
      parent_permlink: post.category || tags?.[0] || 'steemit', // Main tag
      author: this.username, // Author
      permlink: post.permlink, // Permlink
      title: post.title, // Title
      body, // Body
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

    let password = this.password;
    if (safeStorage && safeStorage.isEncryptionAvailable() && password) {
      try {
        password = safeStorage.decryptString(Buffer.from(password, 'hex'));
      } catch {
        // ignore
      }
    }
    const privateKey = PrivateKey.fromString(password);

    // ref: https://github.com/realmankwon/upvu_web/blob/ae7a8ef164d8a8ff9b4b570ca3e65d4e671165de/src/common/helper/posting.ts#L115
    switch (rewardType) {
      case RewardType.DP: // decline payout, 보상 받지않기
        commentOptions.max_accepted_payout = '0.000 SBD';
        commentOptions.percent_steem_dollars = 0;
        break;
      case RewardType.SP: // 100% steem power payout, 100% 스팀파워로 수령
        commentOptions.max_accepted_payout = '1000000.000 SBD';
        commentOptions.percent_steem_dollars = 0; // 10000 === 100% (of 50%)
        break;
      case RewardType.DEFAULT:
      default: // 50% steem power, 50% sd+steem, 스팀파워 50% + 스팀달러 50%로 수령
        commentOptions.max_accepted_payout = '1000000.000 SBD';
        commentOptions.percent_steem_dollars = 10000;
    }

    if (rewardType === RewardType.DEFAULT) {
      return this.client.broadcast.comment(data, privateKey);
    }

    return this.client.broadcast.commentWithOptions(data, commentOptions, privateKey);
  }

  getPost(username: string, permlink: string) {
    return this.client.database.call('get_content', [username, permlink]);
  }
}

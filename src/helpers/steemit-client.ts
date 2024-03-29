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
} from '../types';
import Encrypt from './encrypt';

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
    private readonly appName: string = 'obsidian-steemit',
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
    return post.tags?.split(/\s|,/).map(tag => tag.trim()) ?? [];
  }

  appendDefaultFooter({ body }: SteemitPost): string {
    if (!body.contains(DEFAULT_FOOTER)) body += `\n\n${DEFAULT_FOOTER}`;
    // eslint-disable-next-line no-control-regex
    return body.replace(/\x08/g, '');
  }

  decryptPassword(password: string): string {
    try {
      return Encrypt.decryptString(password);
    } catch (err) {
      console.error('Failed to decrypt password', err);
    }
    return password;
  }

  broadcastPost(commentOperation: CommentOperation[1], rewardType: RewardType) {
    const privateKey = this.createPrivateKey(this.password);

    if ([RewardType.DP, RewardType.SP].includes(rewardType)) {
      const commentOptionsOperation = this.createCommentOptions(commentOperation, rewardType);
      return this.client.broadcast.commentWithOptions(
        commentOperation,
        commentOptionsOperation,
        privateKey,
      );
    }

    return this.client.broadcast.comment(commentOperation, privateKey);
  }

  getPost(username: string, permlink: string) {
    return this.client.database.call('get_content', [username, permlink]);
  }

  publishPost(post: SteemitPost, { rewardType }: SteemitPostOptions) {
    const commentOperation = this.createCommentOperation(post);
    return this.broadcastPost(commentOperation, rewardType);
  }

  createCommentOperation(post: SteemitPost): CommentOperation[1] {
    const jsonMetadata: SteemitJsonMetadata = {
      format: 'markdown',
      app: this.appName,
      tags: this.createTags(post),
    };

    return {
      parent_author: '', // Leave parent author empty
      parent_permlink: post.category || jsonMetadata.tags?.[0] || 'steemit', // Main tag
      author: this.username, // Author
      permlink: post.permlink, // Permlink
      title: post.title, // Title
      body: this.appendDefaultFooter(post), // Body
      json_metadata: JSON.stringify(jsonMetadata), // Json Meta
    };
  }

  createPrivateKey(password: string): PrivateKey {
    const decryptedPassword = this.decryptPassword(password);
    return PrivateKey.fromString(decryptedPassword);
  }

  createCommentOptions(
    data: CommentOperation[1],
    rewardType: RewardType,
  ): CommentOptionsOperation[1] {
    const commentOptions: CommentOptionsOperation[1] = {
      author: data.author,
      permlink: data.permlink,
      max_accepted_payout: '1000000.000 SBD',
      percent_steem_dollars: 10000,
      allow_votes: true,
      allow_curation_rewards: true,
      extensions: [],
    };

    if (rewardType === RewardType.DP) {
      // decline payout
      commentOptions.max_accepted_payout = '0.000 SBD';
      commentOptions.percent_steem_dollars = 0;
    } else if (rewardType === RewardType.SP) {
      // 100% steem power payout
      commentOptions.percent_steem_dollars = 0;
    }

    return commentOptions;
  }
}

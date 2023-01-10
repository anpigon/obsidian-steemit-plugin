import { FrontMatterCache } from 'obsidian';

export interface SteemitFrontMatter extends FrontMatterCache {
  title?: string;
  permlink?: string;
  url?: string;
  tags?: string[];
  tag?: string[];
  category?: string;
}

export enum RewardType {
  DP = '0%',
  SP = '100%',
  DEFAULT = '50%',
}

export interface SteemitPluginSettings {
  category: string;
  username: string;
  password: string;
  appName: string;
  rewardType: RewardType;
}

export interface SteemitJsonMetadata {
  app: string;
  format: string;
  tags?: string[];
  canonical_url?: string;
  image?: string[];
}

export interface SteemitPost {
  category?: string;
  permlink: string;
  title: string;
  body: string;
  tags: string;
  appName?: string;
  rewardType?: RewardType;
}

export interface SteemitRPCError {
  id: number;
  jsonrpc: string;
  error: {
    code: number;
    message: string;
    data: string;
  };
}

export interface SteemitRPCError {
  id: number;
  jsonrpc: string;
  error: {
    code: number;
    message: string;
    data: string;
  };
}

export interface SteemitRPCCommunities {
  id: number;
  jsonrpc: string;
  result: {
    id: number;
    name: string;
    title: string;
    about: string;
    lang: string;
    type_id: number;
    is_nsfw: boolean;
    subscribers: number;
    sum_pending: number;
    num_pending: number;
    num_authors: number;
    created_at: string;
    avatar_url: string;
    context: {
      subscribed: boolean;
      role: string;
      title: string;
    };
    admins: string[];
  }[];
}

export interface SteemitRPCAllSubscriptions {
  id: number;
  jsonrpc: string;
  result: [name: string, title: string, role: string, context: string][];
}

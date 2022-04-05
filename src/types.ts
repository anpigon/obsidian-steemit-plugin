import { FrontMatterCache } from "obsidian";

export interface SteemitFrontMatter extends FrontMatterCache {
  title?: string;
  permlink?: string;
  url?: string;
  tags?: string[];
  tag?: string[];
  category?: string;
  position: {
    end: { line: number; col: number; offset: number };
    start: { line: number; col: number; offset: number };
  };
}

export interface SteemitPluginSettings {
  category: string;
  username: string;
  password: string;
  appName: string;
}

export interface SteemitJsonMetadata {
  app: string;
  format: string;
  tags?: string[];
  canonical_url?: string;
  image?: string[];
}

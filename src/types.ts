export interface SteemitFrontMatter {
  title?: string;
  permlink?: string;
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

export interface SteemitPost {
  category?: string;
  permlink?: string;
  title?: string;
  body?: string;
  tags?: string;
}

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
}

export interface SteemitJsonMetadata {
  app: string;
  tags?: string[];
}

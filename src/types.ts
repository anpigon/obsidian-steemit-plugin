export interface SteemitFrontMatter {
  title?: string;
  permlink?: string;
  tags?: string[];
  tag?: string[];
  category?: string;
}

export interface SteemitPluginSettings {
  category: string;
  username: string;
  password: string;
}

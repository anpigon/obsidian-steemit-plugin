export interface PostToSteemitFrontMatter {
  title?: string;
  permlink?: string;
  tags?: string[];
  tag?: string[];
  category?: string;
}

export interface PostToSteemitPluginSettings {
  category: string;
  username: string;
  password: string;
}

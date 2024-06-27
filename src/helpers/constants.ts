import { RewardType, SteemitPluginSettings } from '../types';

export const DEFAULT_FOOTER =
  '<center><sub>Posted using <a href="https://obsidian.md/plugins?id=obsidian-steemit" target="_blank">Obsidian Steemit plugin</a></sub></center>';

export const DEFAULT_SETTINGS: SteemitPluginSettings = {
  category: '',
  username: '',
  password: '',
  appName: '',
  rewardType: RewardType.DEFAULT,
  tags: '',
};

export const RewardTypeOptions = [
  { value: RewardType.SP, label: 'Power Up 100%' },
  { value: RewardType.DEFAULT, label: 'Default (50% / 50%)' },
  { value: RewardType.DP, label: 'Decline Payout' },
];

export const STAT_CHANNEL_FIELDS = [
  "statChannelAllMembers",
  "statChannelUsers",
  "statChannelBots",
  "statChannelActiveRate",
  "statChannelActiveRateRanking",
] as const;

export type StatChannelField = (typeof STAT_CHANNEL_FIELDS)[number];

export function isStatChannelField(value: string): value is StatChannelField {
  return (STAT_CHANNEL_FIELDS as readonly string[]).includes(value);
}

export const statChannelLabels: Record<
  StatChannelField,
  { shortLabel: string; title: string; description: string }
> = {
  statChannelAllMembers: {
    shortLabel: "全メンバー数",
    title: "統計チャンネル: 全メンバー数",
    description: "選択したVCの名前をサーバーの全メンバー数で自動更新します。",
  },
  statChannelUsers: {
    shortLabel: "ユーザー数",
    title: "統計チャンネル: ユーザー数",
    description: "選択したVCの名前をサーバーのユーザー(bot以外)数で自動更新します。",
  },
  statChannelBots: {
    shortLabel: "Bot数",
    title: "統計チャンネル: Bot数",
    description: "選択したVCの名前をサーバーのbot数で自動更新します。",
  },
  statChannelActiveRate: {
    shortLabel: "アクティブレート",
    title: "統計チャンネル: アクティブレート",
    description: "選択したVCの名前をサーバーの現在のアクティブレートで自動更新します。",
  },
  statChannelActiveRateRanking: {
    shortLabel: "アクティブレートランキング",
    title: "統計チャンネル: アクティブレートランキング",
    description: "選択したVCの名前をアクティブレートの現在順位で自動更新します。",
  },
};

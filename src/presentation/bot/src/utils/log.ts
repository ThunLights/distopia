export const LOG_FIELDS = [
  "logMemberJoin",
  "logMemberLeave",
  "logMemberTimeout",
  "logMemberKick",
  "logMemberBan",
  "logMemberUnban",
  "logRoleCreate",
  "logRoleEdit",
  "logRoleDelete",
  "logChannelCreate",
  "logChannelEdit",
  "logChannelDelete",
  "logMessageEdit",
  "logMessageDelete",
  "logVoiceJoin",
  "logVoiceLeave",
] as const;

export type LogField = (typeof LOG_FIELDS)[number];

export function isLogField(value: string): value is LogField {
  return (LOG_FIELDS as readonly string[]).includes(value);
}

export const logFieldLabels: Record<
  LogField,
  { shortLabel: string; title: string; description: string }
> = {
  logMemberJoin: {
    shortLabel: "メンバー参加",
    title: "ログ設定: メンバー参加",
    description: "メンバーがサーバーに参加した際にログを出力します。",
  },
  logMemberLeave: {
    shortLabel: "メンバー退出",
    title: "ログ設定: メンバー退出",
    description: "メンバーがサーバーから退出した際にログを出力します。",
  },
  logMemberTimeout: {
    shortLabel: "メンバータイムアウト",
    title: "ログ設定: メンバータイムアウト",
    description: "メンバーがタイムアウトされた際にログを出力します。",
  },
  logMemberKick: {
    shortLabel: "メンバーキック",
    title: "ログ設定: メンバーキック",
    description: "メンバーがキックされた際にログを出力します。",
  },
  logMemberBan: {
    shortLabel: "メンバーBAN",
    title: "ログ設定: メンバーBAN",
    description: "メンバーがBANされた際にログを出力します。",
  },
  logMemberUnban: {
    shortLabel: "メンバーBAN解除",
    title: "ログ設定: メンバーBAN解除",
    description: "メンバーのBANが解除された際にログを出力します。",
  },
  logRoleCreate: {
    shortLabel: "ロール作成",
    title: "ログ設定: ロール作成",
    description: "ロールが作成された際にログを出力します。",
  },
  logRoleEdit: {
    shortLabel: "ロール編集",
    title: "ログ設定: ロール編集",
    description: "ロールが編集された際にログを出力します。",
  },
  logRoleDelete: {
    shortLabel: "ロール削除",
    title: "ログ設定: ロール削除",
    description: "ロールが削除された際にログを出力します。",
  },
  logChannelCreate: {
    shortLabel: "チャンネル作成",
    title: "ログ設定: チャンネル作成",
    description: "チャンネルが作成された際にログを出力します。",
  },
  logChannelEdit: {
    shortLabel: "チャンネル編集",
    title: "ログ設定: チャンネル編集",
    description: "チャンネルが編集された際にログを出力します。",
  },
  logChannelDelete: {
    shortLabel: "チャンネル削除",
    title: "ログ設定: チャンネル削除",
    description: "チャンネルが削除された際にログを出力します。",
  },
  logMessageEdit: {
    shortLabel: "メッセージ編集",
    title: "ログ設定: メッセージ編集",
    description: "メッセージが編集された際にログを出力します。",
  },
  logMessageDelete: {
    shortLabel: "メッセージ削除",
    title: "ログ設定: メッセージ削除",
    description: "メッセージが削除された際にログを出力します。",
  },
  logVoiceJoin: {
    shortLabel: "ボイスチャンネル参加",
    title: "ログ設定: ボイスチャンネル参加",
    description: "メンバーがボイスチャンネルに参加した際にログを出力します。",
  },
  logVoiceLeave: {
    shortLabel: "ボイスチャンネル退出",
    title: "ログ設定: ボイスチャンネル退出",
    description: "メンバーがボイスチャンネルから退出した際にログを出力します。",
  },
};

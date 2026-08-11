import type {
  ColorResolvable,
  GuildBan,
  GuildMember,
  Message,
  NonThreadGuildBasedChannel,
  OmitPartialGroupDMChannel,
  PartialGuildMember,
  Role,
} from "discord.js";

import { codeBlock } from "./codeblock";
import type { AllLogField } from "./log";

export type LogEmbedField = { name: string; value: string; inline?: boolean };

export type LogContent = {
  description: string;
  fields?: LogEmbedField[];
};

export type LogFormat<Args extends unknown[] = unknown[]> = {
  title: string;
  color?: ColorResolvable;
  build: (...args: Args) => LogContent | Promise<LogContent>;
};

export const logFormats = {
  logMemberJoin: {
    title: "メンバー参加",
    build: (member: GuildMember) => ({
      description: `<@${member.id}> (${member.id}) がサーバーに参加しました。`,
    }),
  },
  logMemberLeave: {
    title: "メンバー退出",
    build: (member: GuildMember | PartialGuildMember) => ({
      description: `<@${member.id}> (${member.id}) がサーバーから退出しました。`,
    }),
  },
  logMemberKick: {
    title: "メンバーキック",
    build: (member: GuildMember | PartialGuildMember) => ({
      description: `<@${member.id}> (${member.id}) がキックされました。`,
    }),
  },
  logMemberBan: {
    title: "メンバーBAN",
    build: (ban: GuildBan) => ({
      description: [
        `<@${ban.user.id}> (${ban.user.id}) がBANされました。`,
        ban.reason && `理由: ${ban.reason}`,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  },
  logMemberUnban: {
    title: "メンバーBAN解除",
    build: (ban: GuildBan) => ({
      description: `<@${ban.user.id}> (${ban.user.id}) のBANが解除されました。`,
    }),
  },
  logMemberTimeout: {
    title: "メンバータイムアウト",
    build: (member: GuildMember, until: number) => ({
      description: [
        `<@${member.id}> (${member.id}) がタイムアウトされました。`,
        `解除予定: <t:${Math.floor(until / 1000)}:F>`,
      ].join("\n"),
    }),
  },
  logRoleCreate: {
    title: "ロール作成",
    build: (role: Role) => ({
      description: `<@&${role.id}> (${role.name}) が作成されました。`,
    }),
  },
  logRoleEdit: {
    title: "ロール編集",
    build: (role: Role, changes: string[]) => ({
      description: [`<@&${role.id}> (${role.name}) が編集されました。`, ...changes].join("\n"),
    }),
  },
  logRoleDelete: {
    title: "ロール削除",
    build: (role: Role) => ({
      description: `${role.name} (${role.id}) が削除されました。`,
    }),
  },
  logChannelCreate: {
    title: "チャンネル作成",
    build: (channel: NonThreadGuildBasedChannel) => ({
      description: `<#${channel.id}> (${channel.name}) が作成されました。`,
    }),
  },
  logChannelEdit: {
    title: "チャンネル編集",
    build: (channel: NonThreadGuildBasedChannel, changes: string[]) => ({
      description: [`<#${channel.id}> (${channel.name}) が編集されました。`, ...changes].join("\n"),
    }),
  },
  logChannelDelete: {
    title: "チャンネル削除",
    build: (channel: NonThreadGuildBasedChannel) => ({
      description: `${channel.name} (${channel.id}) が削除されました。`,
    }),
  },
  logMessageEdit: {
    title: "メッセージ編集",
    build: async (
      message: OmitPartialGroupDMChannel<Message<boolean>>,
      oldContent: string,
      newContent: string,
    ) => ({
      description: [
        `<@${message.author.id}> (${message.author.id}) がメッセージを編集しました。`,
        `チャンネル: <#${message.channelId}>`,
      ].join("\n"),
      fields: [
        { name: "編集前", value: await codeBlock(oldContent) },
        { name: "編集後", value: await codeBlock(newContent) },
      ],
    }),
  },
  logMessageDelete: {
    title: "メッセージ削除",
    build: async (message: OmitPartialGroupDMChannel<Message<boolean>>, content: string) => ({
      description: [
        `<@${message.author.id}> (${message.author.id}) のメッセージが削除されました。`,
        `チャンネル: <#${message.channelId}>`,
      ].join("\n"),
      fields: [{ name: "内容", value: await codeBlock(content) }],
    }),
  },
  logVoiceJoin: {
    title: "ボイスチャンネル参加",
    build: (memberId: string, channelId: string) => ({
      description: `<@${memberId}> (${memberId}) が <#${channelId}> に参加しました。`,
    }),
  },
  logVoiceLeave: {
    title: "ボイスチャンネル退出",
    build: (memberId: string, channelId: string) => ({
      description: `<@${memberId}> (${memberId}) が <#${channelId}> から退出しました。`,
    }),
  },
  logAntiRaid: {
    title: "荒らし対策: 招待リンクを検知しました",
    color: "Red",
    build: async (message: OmitPartialGroupDMChannel<Message<boolean>>, inviteLinks: string[]) => ({
      description: [
        `ユーザー: <@${message.author.id}> (${message.author.id})`,
        `チャンネル: <#${message.channelId}>`,
      ].join("\n"),
      fields: [{ name: "検知したリンク", value: await codeBlock(inviteLinks.join("\n")) }],
    }),
  },
} satisfies Record<AllLogField, LogFormat<any>>;

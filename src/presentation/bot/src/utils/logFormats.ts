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

export type LogFormat<Args extends unknown[] = unknown[]> = {
  title: string;
  color?: ColorResolvable;
  build: (...args: Args) => string | Promise<string>;
};

export const logFormats = {
  logMemberJoin: {
    title: "メンバー参加",
    build: (member: GuildMember) => `<@${member.id}> (${member.id}) がサーバーに参加しました。`,
  },
  logMemberLeave: {
    title: "メンバー退出",
    build: (member: GuildMember | PartialGuildMember) =>
      `<@${member.id}> (${member.id}) がサーバーから退出しました。`,
  },
  logMemberKick: {
    title: "メンバーキック",
    build: (member: GuildMember | PartialGuildMember) =>
      `<@${member.id}> (${member.id}) がキックされました。`,
  },
  logMemberBan: {
    title: "メンバーBAN",
    build: (ban: GuildBan) =>
      [`<@${ban.user.id}> (${ban.user.id}) がBANされました。`, ban.reason && `理由: ${ban.reason}`]
        .filter(Boolean)
        .join("\n"),
  },
  logMemberUnban: {
    title: "メンバーBAN解除",
    build: (ban: GuildBan) => `<@${ban.user.id}> (${ban.user.id}) のBANが解除されました。`,
  },
  logMemberTimeout: {
    title: "メンバータイムアウト",
    build: (member: GuildMember, until: number) =>
      [
        `<@${member.id}> (${member.id}) がタイムアウトされました。`,
        `解除予定: <t:${Math.floor(until / 1000)}:F>`,
      ].join("\n"),
  },
  logRoleCreate: {
    title: "ロール作成",
    build: (role: Role) => `<@&${role.id}> (${role.name}) が作成されました。`,
  },
  logRoleEdit: {
    title: "ロール編集",
    build: (role: Role, changes: string[]) =>
      [`<@&${role.id}> (${role.name}) が編集されました。`, ...changes].join("\n"),
  },
  logRoleDelete: {
    title: "ロール削除",
    build: (role: Role) => `${role.name} (${role.id}) が削除されました。`,
  },
  logChannelCreate: {
    title: "チャンネル作成",
    build: (channel: NonThreadGuildBasedChannel) =>
      `<#${channel.id}> (${channel.name}) が作成されました。`,
  },
  logChannelEdit: {
    title: "チャンネル編集",
    build: (channel: NonThreadGuildBasedChannel, changes: string[]) =>
      [`<#${channel.id}> (${channel.name}) が編集されました。`, ...changes].join("\n"),
  },
  logChannelDelete: {
    title: "チャンネル削除",
    build: (channel: NonThreadGuildBasedChannel) =>
      `${channel.name} (${channel.id}) が削除されました。`,
  },
  logMessageEdit: {
    title: "メッセージ編集",
    build: (
      message: OmitPartialGroupDMChannel<Message<boolean>>,
      oldContent: string,
      newContent: string,
    ) =>
      [
        `<@${message.author.id}> (${message.author.id}) がメッセージを編集しました。`,
        `チャンネル: <#${message.channelId}>`,
        `編集前: ${oldContent}`,
        `編集後: ${newContent}`,
      ].join("\n"),
  },
  logMessageDelete: {
    title: "メッセージ削除",
    build: (message: OmitPartialGroupDMChannel<Message<boolean>>, content: string) =>
      [
        `<@${message.author.id}> (${message.author.id}) のメッセージが削除されました。`,
        `チャンネル: <#${message.channelId}>`,
        `内容: ${content}`,
      ].join("\n"),
  },
  logVoiceJoin: {
    title: "ボイスチャンネル参加",
    build: (memberId: string, channelId: string) =>
      `<@${memberId}> (${memberId}) が <#${channelId}> に参加しました。`,
  },
  logVoiceLeave: {
    title: "ボイスチャンネル退出",
    build: (memberId: string, channelId: string) =>
      `<@${memberId}> (${memberId}) が <#${channelId}> から退出しました。`,
  },
  logAntiRaid: {
    title: "荒らし対策: 招待リンクを検知しました",
    color: "Red",
    build: async (message: OmitPartialGroupDMChannel<Message<boolean>>, inviteLinks: string[]) =>
      [
        `ユーザー: <@${message.author.id}> (${message.author.id})`,
        `チャンネル: <#${message.channelId}>`,
        "検知したリンク:",
        await codeBlock(inviteLinks.join("\n")),
      ].join("\n"),
  },
} satisfies Record<AllLogField, LogFormat<any>>;

import type {
  GuildBan,
  GuildMember,
  Message,
  NonThreadGuildBasedChannel,
  OmitPartialGroupDMChannel,
  PartialGuildMember,
  PartialUser,
  Role,
  User,
} from "discord.js";
import { lineDiff } from "infra-diff";
import { codeBlockChunks } from "presentation-bot-kit/codeblock";
import type { LogEmbedField, LogFormat } from "presentation-bot-kit/logging/format";

import type { LogField } from "./log";

type AttachmentCollection = OmitPartialGroupDMChannel<Message<boolean>>["attachments"];

function summarizeAttachments(attachments: AttachmentCollection): {
  image?: string;
  fields: LogEmbedField[];
} {
  const images = attachments.filter((attachment) => attachment.contentType?.startsWith("image/"));
  const videos = attachments.filter((attachment) => attachment.contentType?.startsWith("video/"));

  const fields: LogEmbedField[] = [];

  if (images.size) {
    fields.push({
      name: `画像 (${images.size})`,
      value: images.map((attachment) => `[${attachment.name}](${attachment.url})`).join("\n"),
    });
  }

  if (videos.size) {
    fields.push({
      name: `動画 (${videos.size})`,
      value: videos.map((attachment) => `[${attachment.name}](${attachment.url})`).join("\n"),
    });
  }

  return { image: images.first()?.url, fields };
}

// Numbered so a reader can tell the pages apart once they span several follow-up messages.
function continuationFields(name: string, pages: string[]): LogEmbedField[] {
  return pages.map((value, index) => ({
    name: `${name} (続き ${index + 2}/${pages.length + 1})`,
    value,
  }));
}

function executorLine(executor: User | PartialUser | null): string {
  return `実行者: ${executor ? `<@${executor.id}> (${executor.id})` : "不明"}`;
}

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
    build: (member: GuildMember | PartialGuildMember, executor: User | PartialUser | null) => ({
      description: [
        `<@${member.id}> (${member.id}) がキックされました。`,
        executorLine(executor),
      ].join("\n"),
    }),
  },
  logMemberBan: {
    title: "メンバーBAN",
    build: (ban: GuildBan, executor: User | PartialUser | null) => ({
      description: [
        `<@${ban.user.id}> (${ban.user.id}) がBANされました。`,
        executorLine(executor),
        ban.reason && `理由: ${ban.reason}`,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  },
  logMemberUnban: {
    title: "メンバーBAN解除",
    build: (ban: GuildBan, executor: User | PartialUser | null) => ({
      description: [
        `<@${ban.user.id}> (${ban.user.id}) のBANが解除されました。`,
        executorLine(executor),
      ].join("\n"),
    }),
  },
  logMemberTimeout: {
    title: "メンバータイムアウト",
    build: (member: GuildMember, until: number, executor: User | PartialUser | null) => ({
      description: [
        `<@${member.id}> (${member.id}) がタイムアウトされました。`,
        executorLine(executor),
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
      /** null when the pre-edit message wasn't cached, so there's nothing to diff against. */
      oldContent: string | null,
      newContent: string,
      oldAttachments?: AttachmentCollection,
    ) => {
      const { image, fields: attachmentFields } = summarizeAttachments(message.attachments);
      const removedAttachments = oldAttachments?.filter(
        (attachment) => !message.attachments.has(attachment.id),
      );

      const contentFields: LogEmbedField[] = [];
      const overflowFields: LogEmbedField[] = [];
      if (oldContent === null) {
        const [first, ...rest] = codeBlockChunks(newContent || "(空)");
        contentFields.push(
          { name: "編集前", value: "(内容不明)" },
          { name: "編集後", value: first },
        );
        overflowFields.push(...continuationFields("編集後", rest));
      } else {
        const diff = lineDiff(oldContent, newContent);
        const [first, ...rest] = diff ? codeBlockChunks(diff, "diff") : ["(本文の変更なし)"];
        contentFields.push({ name: "変更内容", value: first });
        overflowFields.push(...continuationFields("変更内容", rest));
      }

      return {
        description: [
          `<@${message.author.id}> (${message.author.id}) がメッセージを編集しました。`,
          `チャンネル: <#${message.channelId}>`,
        ].join("\n"),
        image,
        fields: [
          ...contentFields,
          ...attachmentFields,
          ...(removedAttachments?.size
            ? [
                {
                  name: `削除された添付ファイル (${removedAttachments.size})`,
                  value: removedAttachments
                    .map((attachment) => `[${attachment.name}](${attachment.url})`)
                    .join("\n"),
                },
              ]
            : []),
        ],
        ...(overflowFields.length ? { overflowFields } : {}),
      };
    },
  },
  logMessageDelete: {
    title: "メッセージ削除",
    build: async (message: OmitPartialGroupDMChannel<Message<boolean>>, content: string) => {
      const { image, fields: attachmentFields } = summarizeAttachments(message.attachments);
      const [value, ...rest] = codeBlockChunks(content);
      const overflowFields = continuationFields("内容", rest);

      return {
        description: [
          `<@${message.author.id}> (${message.author.id}) のメッセージが削除されました。`,
          `チャンネル: <#${message.channelId}>`,
        ].join("\n"),
        image,
        fields: [{ name: "内容", value }, ...attachmentFields],
        ...(overflowFields.length ? { overflowFields } : {}),
      };
    },
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
} satisfies Record<LogField, LogFormat<any>>;

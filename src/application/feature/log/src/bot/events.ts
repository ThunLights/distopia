import { AuditLogEvent } from "discord.js";
import type { FeatureEvents } from "presentation-bot-kit/feature";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";
import { Logger } from "presentation-bot-kit/logging/Logger";

export const events: FeatureEvents = {
  channelCreate: async (core, channel) => {
    await new Logger(core).log(channel.guild, "logChannelCreate", channel);
  },

  channelDelete: async (core, channel) => {
    if (channel.isDMBased()) {
      return;
    }

    await new Logger(core).log(channel.guild, "logChannelDelete", channel);
  },

  channelUpdate: async (core, oldChannel, newChannel) => {
    if (oldChannel.isDMBased() || newChannel.isDMBased()) {
      return;
    }

    const changes: string[] = [];

    if (oldChannel.name !== newChannel.name) {
      changes.push(`名前: ${oldChannel.name} → ${newChannel.name}`);
    }

    if ("topic" in oldChannel && "topic" in newChannel && oldChannel.topic !== newChannel.topic) {
      changes.push("トピックが変更されました。");
    }

    if (changes.length === 0) {
      return;
    }

    await new Logger(core).log(newChannel.guild, "logChannelEdit", newChannel, changes);
  },

  roleCreate: async (core, role) => {
    await new Logger(core).log(role.guild, "logRoleCreate", role);
  },

  roleDelete: async (core, role) => {
    await new Logger(core).log(role.guild, "logRoleDelete", role);
  },

  roleUpdate: async (core, oldRole, newRole) => {
    const changes: string[] = [];

    if (oldRole.name !== newRole.name) {
      changes.push(`名前: ${oldRole.name} → ${newRole.name}`);
    }
    if (oldRole.hexColor !== newRole.hexColor) {
      changes.push(`カラー: ${oldRole.hexColor} → ${newRole.hexColor}`);
    }
    if (oldRole.hoist !== newRole.hoist) {
      changes.push(
        `表示設定: ${oldRole.hoist ? "分離表示" : "統合表示"} → ${newRole.hoist ? "分離表示" : "統合表示"}`,
      );
    }
    if (oldRole.mentionable !== newRole.mentionable) {
      changes.push(
        `メンション可否: ${oldRole.mentionable ? "可" : "不可"} → ${newRole.mentionable ? "可" : "不可"}`,
      );
    }
    if (!oldRole.permissions.equals(newRole.permissions)) {
      changes.push("権限が変更されました。");
    }

    if (changes.length === 0) {
      return;
    }

    await new Logger(core).log(newRole.guild, "logRoleEdit", newRole, changes);
  },

  guildBanAdd: async (core, ban) => {
    const entry = await findRecentAuditLogEntry(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);

    await new Logger(core).log(ban.guild, "logMemberBan", ban, entry?.executor ?? null);
  },

  guildBanRemove: async (core, ban) => {
    const entry = await findRecentAuditLogEntry(
      ban.guild,
      AuditLogEvent.MemberBanRemove,
      ban.user.id,
    );

    await new Logger(core).log(ban.guild, "logMemberUnban", ban, entry?.executor ?? null);
  },

  guildMemberAdd: async (core, member) => {
    await new Logger(core).log(member.guild, "logMemberJoin", member);
  },

  guildMemberRemove: async (core, member) => {
    const banEntry = await findRecentAuditLogEntry(
      member.guild,
      AuditLogEvent.MemberBanAdd,
      member.id,
    );

    if (banEntry) {
      // Already logged by guildBanAdd.
      return;
    }

    const kickEntry = await findRecentAuditLogEntry(
      member.guild,
      AuditLogEvent.MemberKick,
      member.id,
    );

    if (kickEntry) {
      await new Logger(core).log(member.guild, "logMemberKick", member, kickEntry.executor);
      return;
    }

    await new Logger(core).log(member.guild, "logMemberLeave", member);
  },

  guildMemberUpdate: async (core, oldMember, newMember) => {
    const now = Date.now();
    const oldUntil = oldMember.communicationDisabledUntilTimestamp;
    const newUntil = newMember.communicationDisabledUntilTimestamp;

    const wasTimedOut = oldUntil !== null && oldUntil > now;
    const isNewTimeout = newUntil !== null && newUntil > now && !wasTimedOut;

    if (!isNewTimeout) {
      return;
    }

    const entry = await findRecentAuditLogEntry(
      newMember.guild,
      AuditLogEvent.MemberUpdate,
      newMember.id,
      (candidate) =>
        candidate.changes.some(
          (change) =>
            change.key === "communication_disabled_until" &&
            typeof change.new === "string" &&
            new Date(change.new).getTime() === newUntil,
        ),
    );

    await new Logger(core).log(
      newMember.guild,
      "logMemberTimeout",
      newMember,
      newUntil,
      entry?.executor ?? null,
    );
  },

  messageDelete: async (core, message) => {
    if (!message.guild || message.partial || message.author.bot) {
      return;
    }

    const content = message.content || "(空)";

    await new Logger(core).log(message.guild, "logMessageDelete", message, content);
  },

  messageUpdate: async (core, oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.author.bot) {
      return;
    }

    if (
      !oldMessage.partial &&
      oldMessage.content === newMessage.content &&
      oldMessage.attachments.size === newMessage.attachments.size &&
      oldMessage.attachments.every((attachment) => newMessage.attachments.has(attachment.id))
    ) {
      return;
    }

    const oldContent = oldMessage.partial ? null : oldMessage.content;
    const oldAttachments = oldMessage.partial ? undefined : oldMessage.attachments;

    await new Logger(core).log(
      newMessage.guild,
      "logMessageEdit",
      newMessage,
      oldContent,
      newMessage.content,
      oldAttachments,
    );
  },

  voiceStateUpdate: async (core, oldState, newState) => {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    if (oldState.channelId) {
      await new Logger(core).log(newState.guild, "logVoiceLeave", newState.id, oldState.channelId);
    }

    if (newState.channelId) {
      await new Logger(core).log(newState.guild, "logVoiceJoin", newState.id, newState.channelId);
    }
  },
};

import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export class GuildMemberRemoveEvent extends FeatureEventBase<"guildMemberRemove"> {
  public override readonly event = "guildMemberRemove";
  public override readonly priority = EventPriority.Logging;

  public override async handle(member: GuildMember | PartialGuildMember) {
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
      await sendLog(this.core, member.guild, "logMemberKick", member, kickEntry.executor);
      return;
    }

    await sendLog(this.core, member.guild, "logMemberLeave", member);
  }
}

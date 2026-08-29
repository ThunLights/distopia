import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";

import { findRecentAuditLogEntry } from "../utils/logging/auditLog";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberRemoveHandler extends BaseHandler<
  (member: GuildMember | PartialGuildMember) => void
> {
  public override async handle(member: GuildMember | PartialGuildMember): Promise<void> {
    const banEntry = await findRecentAuditLogEntry(
      member.guild,
      AuditLogEvent.MemberBanAdd,
      member.id,
    );

    if (banEntry) {
      // Already logged by GuildBanAddHandler.
      return;
    }

    const kickEntry = await findRecentAuditLogEntry(
      member.guild,
      AuditLogEvent.MemberKick,
      member.id,
    );

    if (kickEntry) {
      await this.logger.log(member.guild, "logMemberKick", member, kickEntry.executor);
      return;
    }

    await this.logger.log(member.guild, "logMemberLeave", member);
    await this.welcomeMessenger.send(member.guild, member, "leave");
  }
}

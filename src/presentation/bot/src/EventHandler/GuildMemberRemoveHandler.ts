import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";

import { BaseHandler } from "./BaseHandler";

const recentAuditLogWindowMs = 5000;

export class GuildMemberRemoveHandler extends BaseHandler<
  (member: GuildMember | PartialGuildMember) => void
> {
  public override async handle(member: GuildMember | PartialGuildMember): Promise<void> {
    const classification = await this.classifyRemoval(member);

    if (classification === "ban") {
      // Already logged by GuildBanAddHandler.
      return;
    }

    if (classification === "kick") {
      await this.logger.log(member.guild, "logMemberKick", member);
      return;
    }

    await this.logger.log(member.guild, "logMemberLeave", member);
  }

  private async classifyRemoval(
    member: GuildMember | PartialGuildMember,
  ): Promise<"ban" | "kick" | "leave"> {
    const recentThreshold = Date.now() - recentAuditLogWindowMs;

    try {
      const banLogs = await member.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberBanAdd,
        limit: 3,
      });

      for (const entry of banLogs.entries.values()) {
        if (entry.targetId === member.id && entry.createdTimestamp >= recentThreshold) {
          return "ban";
        }
      }

      const kickLogs = await member.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberKick,
        limit: 3,
      });

      for (const entry of kickLogs.entries.values()) {
        if (entry.targetId === member.id && entry.createdTimestamp >= recentThreshold) {
          return "kick";
        }
      }
    } catch {
      // Missing "View Audit Log" permission or fetch failure — fall back to "leave".
    }

    return "leave";
  }
}

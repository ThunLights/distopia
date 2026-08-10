import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";

import { sendLog } from "../utils/sendLog";
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
      await sendLog(
        this.core,
        member.guild,
        "logMemberKick",
        "メンバーキック",
        `<@${member.id}> (${member.id}) がキックされました。`,
      );
      return;
    }

    await sendLog(
      this.core,
      member.guild,
      "logMemberLeave",
      "メンバー退出",
      `<@${member.id}> (${member.id}) がサーバーから退出しました。`,
    );
  }

  private async classifyRemoval(
    member: GuildMember | PartialGuildMember,
  ): Promise<"ban" | "kick" | "leave"> {
    try {
      const auditLogs = await member.guild.fetchAuditLogs({ limit: 5 });
      const recentThreshold = Date.now() - recentAuditLogWindowMs;

      for (const entry of auditLogs.entries.values()) {
        if (entry.targetId !== member.id || entry.createdTimestamp < recentThreshold) {
          continue;
        }

        if (entry.action === AuditLogEvent.MemberBanAdd) {
          return "ban";
        }
        if (entry.action === AuditLogEvent.MemberKick) {
          return "kick";
        }
      }
    } catch {
      // Missing "View Audit Log" permission or fetch failure — fall back to "leave".
    }

    return "leave";
  }
}

import { AuditLogEvent, type GuildBan } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export class GuildBanAddEvent extends FeatureEventBase<"guildBanAdd"> {
  public override readonly event = "guildBanAdd";
  public override readonly priority = EventPriority.Logging;

  public override async handle(ban: GuildBan) {
    const entry = await findRecentAuditLogEntry(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
    await sendLog(this.core, ban.guild, "logMemberBan", ban, entry?.executor ?? null);
  }
}

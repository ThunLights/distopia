import { AuditLogEvent, type GuildBan } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export class GuildBanRemoveEvent extends FeatureEventBase<"guildBanRemove"> {
  public override readonly event = "guildBanRemove";

  public override async handle(ban: GuildBan) {
    const entry = await findRecentAuditLogEntry(
      ban.guild,
      AuditLogEvent.MemberBanRemove,
      ban.user.id,
    );
    await sendLog(this.core, ban.guild, "logMemberUnban", ban, entry?.executor ?? null);
  }
}

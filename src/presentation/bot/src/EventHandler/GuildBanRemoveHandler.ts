import { AuditLogEvent, type GuildBan } from "discord.js";

import { findRecentAuditLogEntry } from "../utils/logging/auditLog";
import { BaseHandler } from "./BaseHandler";

export class GuildBanRemoveHandler extends BaseHandler<(ban: GuildBan) => void> {
  public override async handle(ban: GuildBan): Promise<void> {
    const entry = await findRecentAuditLogEntry(
      ban.guild,
      AuditLogEvent.MemberBanRemove,
      ban.user.id,
    );

    await this.logger.log(ban.guild, "logMemberUnban", ban, entry?.executor ?? null);
  }
}

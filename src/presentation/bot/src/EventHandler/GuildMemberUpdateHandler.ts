import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";

import { findRecentAuditLogEntry } from "../utils/auditLog";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberUpdateHandler extends BaseHandler<
  (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => void
> {
  public override async handle(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ): Promise<void> {
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

    await this.logger.log(
      newMember.guild,
      "logMemberTimeout",
      newMember,
      newUntil,
      entry?.executor ?? null,
    );
  }
}

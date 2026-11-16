import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export class GuildMemberUpdateEvent extends FeatureEventBase<"guildMemberUpdate"> {
  public override readonly event = "guildMemberUpdate";

  public override async handle(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ) {
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

    await sendLog(
      this.core,
      newMember.guild,
      "logMemberTimeout",
      newMember,
      newUntil,
      entry?.executor ?? null,
    );
  }
}

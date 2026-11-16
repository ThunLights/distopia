import { AuditLogEvent } from "discord.js";
import type { FeatureEventListener } from "presentation-bot-kit/feature";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export const guildMemberUpdate: FeatureEventListener<"guildMemberUpdate"> = async (
  core,
  oldMember,
  newMember,
) => {
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
    core,
    newMember.guild,
    "logMemberTimeout",
    newMember,
    newUntil,
    entry?.executor ?? null,
  );
};

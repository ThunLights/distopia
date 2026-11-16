import { AuditLogEvent } from "discord.js";
import type { FeatureEventListener } from "presentation-bot-kit/feature";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export const guildBanRemove: FeatureEventListener<"guildBanRemove"> = async (core, ban) => {
  const entry = await findRecentAuditLogEntry(
    ban.guild,
    AuditLogEvent.MemberBanRemove,
    ban.user.id,
  );

  await sendLog(core, ban.guild, "logMemberUnban", ban, entry?.executor ?? null);
};

import { AuditLogEvent } from "discord.js";
import type { FeatureEventListener } from "presentation-bot-kit/feature";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export const guildBanAdd: FeatureEventListener<"guildBanAdd"> = async (core, ban) => {
  const entry = await findRecentAuditLogEntry(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);

  await sendLog(core, ban.guild, "logMemberBan", ban, entry?.executor ?? null);
};

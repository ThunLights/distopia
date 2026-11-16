import { AuditLogEvent } from "discord.js";
import type { FeatureEventListener } from "presentation-bot-kit/feature";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { sendLog } from "../sendLog";

export const guildMemberRemove: FeatureEventListener<"guildMemberRemove"> = async (
  core,
  member,
) => {
  const banEntry = await findRecentAuditLogEntry(
    member.guild,
    AuditLogEvent.MemberBanAdd,
    member.id,
  );

  if (banEntry) {
    // Already logged by guildBanAdd.
    return;
  }

  const kickEntry = await findRecentAuditLogEntry(
    member.guild,
    AuditLogEvent.MemberKick,
    member.id,
  );

  if (kickEntry) {
    await sendLog(core, member.guild, "logMemberKick", member, kickEntry.executor);
    return;
  }

  await sendLog(core, member.guild, "logMemberLeave", member);
};

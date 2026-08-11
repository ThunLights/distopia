import type { AuditLogEvent, Guild, PartialUser, User } from "discord.js";

const recentAuditLogWindowMs = 5000;

export type AuditLogExecutorEntry = {
  targetId: string | null;
  createdTimestamp: number;
  executor: User | PartialUser | null;
};

/**
 * Best-effort lookup for the audit log entry behind a just-observed gateway
 * event. Discord doesn't include the executor on the gateway event itself
 * (guildBanAdd/guildBanRemove/guildMemberRemove/guildMemberUpdate), so this
 * correlates by target + a short recency window instead.
 */
export async function findRecentAuditLogEntry(
  guild: Guild,
  type: AuditLogEvent,
  targetId: string,
): Promise<AuditLogExecutorEntry | null> {
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 3 });
    const recentThreshold = Date.now() - recentAuditLogWindowMs;

    for (const entry of logs.entries.values()) {
      if (entry.targetId === targetId && entry.createdTimestamp >= recentThreshold) {
        return entry;
      }
    }
  } catch {
    // Missing "View Audit Log" permission or fetch failure.
  }

  return null;
}

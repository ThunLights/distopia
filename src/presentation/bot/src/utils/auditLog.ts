import type { AuditLogChange, AuditLogEvent, Guild, PartialUser, User } from "discord.js";

const recentAuditLogWindowMs = 5000;

export type AuditLogExecutorEntry = {
  targetId: string | null;
  createdTimestamp: number;
  executor: User | PartialUser | null;
  changes: AuditLogChange[];
};

/**
 * Best-effort lookup for the audit log entry behind a just-observed gateway
 * event. Discord doesn't include the executor on the gateway event itself
 * (guildBanAdd/guildBanRemove/guildMemberRemove/guildMemberUpdate), so this
 * correlates by target + a short recency window instead. `predicate` narrows
 * further when the event type alone is ambiguous (e.g. MemberUpdate covers
 * nickname/voice/timeout changes, not just the one being logged).
 */
export async function findRecentAuditLogEntry(
  guild: Guild,
  type: AuditLogEvent,
  targetId: string,
  predicate?: (entry: AuditLogExecutorEntry) => boolean,
): Promise<AuditLogExecutorEntry | null> {
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 5 });
    const recentThreshold = Date.now() - recentAuditLogWindowMs;

    for (const entry of logs.entries.values()) {
      if (
        entry.targetId === targetId &&
        entry.createdTimestamp >= recentThreshold &&
        (!predicate || predicate(entry))
      ) {
        return entry;
      }
    }
  } catch {
    // Missing "View Audit Log" permission or fetch failure.
  }

  return null;
}

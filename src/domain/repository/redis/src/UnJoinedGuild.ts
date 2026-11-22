import type { RedisClient } from "infra-redis";

import { ExpiringDate } from "./ExpiringDate";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

const KEEP_AFTER_DEADLINE_MS = 7 * 24 * 60 * 60 * 1000;

export class UnJoinedGuild extends ExpiringDate {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    // Deliberately not { reset: true } -- Guild.removeUnJoinedGuildData sets this once to
    // "now + 8h" and only deletes the guild once that deadline passes. Resetting it on every
    // deploy would restart the 8h countdown each time, and if deploys happen more often than
    // every 8h, the deadline would never be reached.
    super(redis, owner, "unJoinedGuild");
  }

  // A key that expired at its deadline would be gone before any tick could see it had passed,
  // which reads as "just left" and starts the 8h over.
  protected override ttlSeconds(limit: Date): number {
    return super.ttlSeconds(new Date(limit.getTime() + KEEP_AFTER_DEADLINE_MS));
  }
}

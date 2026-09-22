import type { RedisClient } from "infra-redis";

import { ExpiringDate } from "./ExpiringDate";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export class UnJoinedGuild extends ExpiringDate {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    // Deliberately not { reset: true } -- Guild.removeUnJoinedGuildData sets this once to
    // "now + 8h" and only deletes the guild once that deadline passes. Resetting it on every
    // deploy would restart the 8h countdown each time, and if deploys happen more often than
    // every 8h, the deadline would never be reached.
    super(redis, owner, "unJoinedGuild");
  }
}

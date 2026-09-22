import type { RedisClient } from "infra-redis";

import { ExpiringDate } from "./ExpiringDate";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export class GuildBumpRateLimit extends ExpiringDate {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "ratelimit:bump", { reset: true });
  }
}

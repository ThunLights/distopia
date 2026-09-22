import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type Guilds = {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  isBotJoined: boolean;
  isPublic: boolean;
}[];

// 5 min -- matches the old OAuth2Guilds.gc()'s unconditional every-short-interval clear
// (setScheduleTask's */5 cron), just applied per-entry instead of as a full sweep.
const FIVE_MINUTES = 5 * 60;

export class OAuth2Guilds extends ExpiringValue<Guilds> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "oauth2Guilds", FIVE_MINUTES);
  }
}

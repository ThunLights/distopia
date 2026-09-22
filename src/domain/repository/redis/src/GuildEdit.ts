import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildEditValue = {
  description?: string;
  nsfw?: boolean;
  pub?: boolean;
  tags?: string[];
  invite?: string;
  updated: Date;
};

const TWO_HOURS = 2 * 60 * 60;

export class GuildEdit extends ExpiringValue<GuildEditValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildEdit", TWO_HOURS);
  }
}

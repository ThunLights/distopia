import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildDictionaryEntry = {
  guildId: string;
  word: string;
  reading: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildDictionaryValue = {
  entries: GuildDictionaryEntry[];
  createdAt: Date;
};

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildDictionary extends ExpiringValue<GuildDictionaryValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildDictionary", TWELVE_HOURS);
  }
}

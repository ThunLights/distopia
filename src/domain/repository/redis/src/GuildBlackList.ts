import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildBlackListEntry = {
  guildId: string;
  blackListId: number;
  autoBan: boolean;
  banTags: string[];
  logChannel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildBlackListValue = {
  entries: GuildBlackListEntry[];
  createdAt: Date;
};

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildBlackList extends ExpiringValue<GuildBlackListValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildBlackList", TWELVE_HOURS);
  }
}

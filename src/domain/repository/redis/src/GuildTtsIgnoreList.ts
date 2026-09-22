import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildTtsIgnoreListEntry = {
  guildId: string;
  targetId: string;
  idType: "UserId" | "ChannelId";
  createdAt: Date;
};

export type GuildTtsIgnoreListValue = {
  entries: GuildTtsIgnoreListEntry[];
  createdAt: Date;
};

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildTtsIgnoreList extends ExpiringValue<GuildTtsIgnoreListValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildTtsIgnoreList", TWELVE_HOURS);
  }
}

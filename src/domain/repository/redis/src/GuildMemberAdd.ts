import type { RedisClient } from "infra-redis";

import { RedisHashMap } from "./RedisHashMap";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildMemberAddValue = {
  memberIds: string[];
  updatedAt: Date;
};

export class GuildMemberAdd extends RedisHashMap<GuildMemberAddValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildMemberAdd", { reset: true });
  }
}

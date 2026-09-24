import type { RedisClient } from "infra-redis";
import z from "zod";

import { RedisHashMap } from "./RedisHashMap";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildMemberAddValue = {
  memberIds: string[];
  updatedAt: Date;
};

const GuildMemberAddValueSchema = z.object({
  memberIds: z.array(z.string()),
  updatedAt: z.date(),
}) satisfies z.ZodType<GuildMemberAddValue>;

export class GuildMemberAdd extends RedisHashMap<GuildMemberAddValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildMemberAdd", { schema: GuildMemberAddValueSchema });
  }
}

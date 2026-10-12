import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildVerifyValue = {
  guildId: string;
  enabled: boolean;
  channelId: string | null;
  roleId: string | null;
  pendingRoleId: string | null;
  createdAt: Date;
};

const nullableString = z.string().nullable();

const GuildVerifyValueSchema = z.compile(
  z.object({
    guildId: z.string(),
    enabled: z.boolean(),
    channelId: nullableString,
    roleId: nullableString,
    pendingRoleId: nullableString,
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildVerifyValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildVerify extends ExpiringValue<GuildVerifyValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildVerify", TWELVE_HOURS, { schema: GuildVerifyValueSchema });
  }
}

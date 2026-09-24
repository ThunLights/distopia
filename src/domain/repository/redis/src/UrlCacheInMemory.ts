import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type UrlCacheInMemoryValue = {
  isInviteLink: boolean;
  createdAt: Date;
};

const UrlCacheInMemoryValueSchema = z.compile(
  z.object({
    isInviteLink: z.boolean(),
    createdAt: z.date(),
  }) satisfies z.ZodType<UrlCacheInMemoryValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class UrlCacheInMemory extends ExpiringValue<UrlCacheInMemoryValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "urlCacheInMemory", TWELVE_HOURS, { schema: UrlCacheInMemoryValueSchema });
  }
}

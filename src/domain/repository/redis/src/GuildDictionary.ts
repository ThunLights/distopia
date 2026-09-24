import type { RedisClient } from "infra-redis";
import z from "zod";

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

const GuildDictionaryEntrySchema = z.object({
  guildId: z.string(),
  word: z.string(),
  reading: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<GuildDictionaryEntry>;

const GuildDictionaryValueSchema = z.compile(
  z.object({
    entries: z.array(GuildDictionaryEntrySchema),
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildDictionaryValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildDictionary extends ExpiringValue<GuildDictionaryValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildDictionary", TWELVE_HOURS, { schema: GuildDictionaryValueSchema });
  }
}

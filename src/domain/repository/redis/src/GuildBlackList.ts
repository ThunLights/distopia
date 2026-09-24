import type { RedisClient } from "infra-redis";
import z from "zod";

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

const GuildBlackListEntrySchema = z.object({
  guildId: z.string(),
  blackListId: z.number(),
  autoBan: z.boolean(),
  banTags: z.array(z.string()),
  logChannel: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<GuildBlackListEntry>;

const GuildBlackListValueSchema = z.compile(
  z.object({
    entries: z.array(GuildBlackListEntrySchema),
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildBlackListValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildBlackList extends ExpiringValue<GuildBlackListValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildBlackList", TWELVE_HOURS, { schema: GuildBlackListValueSchema });
  }
}

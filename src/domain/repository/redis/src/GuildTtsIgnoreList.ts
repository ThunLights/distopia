import type { RedisClient } from "infra-redis";
import z from "zod";

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

const GuildTtsIgnoreListEntrySchema = z.object({
  guildId: z.string(),
  targetId: z.string(),
  idType: z.enum(["UserId", "ChannelId"]),
  createdAt: z.date(),
}) satisfies z.ZodType<GuildTtsIgnoreListEntry>;

const GuildTtsIgnoreListValueSchema = z.object({
  entries: z.array(GuildTtsIgnoreListEntrySchema),
  createdAt: z.date(),
}) satisfies z.ZodType<GuildTtsIgnoreListValue>;

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildTtsIgnoreList extends ExpiringValue<GuildTtsIgnoreListValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildTtsIgnoreList", TWELVE_HOURS, {
      schema: GuildTtsIgnoreListValueSchema,
    });
  }
}

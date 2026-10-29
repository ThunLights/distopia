import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildStickyMessageEntry = {
  guildId: string;
  channelId: string;
  content: string;
  messageId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildStickyMessageValue = {
  entries: GuildStickyMessageEntry[];
  createdAt: Date;
};

const GuildStickyMessageEntrySchema = z.object({
  guildId: z.string(),
  channelId: z.string(),
  content: z.string(),
  messageId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<GuildStickyMessageEntry>;

const GuildStickyMessageValueSchema = z.compile(
  z.object({
    entries: z.array(GuildStickyMessageEntrySchema),
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildStickyMessageValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildStickyMessage extends ExpiringValue<GuildStickyMessageValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildStickyMessage", TWELVE_HOURS, {
      schema: GuildStickyMessageValueSchema,
    });
  }
}

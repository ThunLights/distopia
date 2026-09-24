import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildEditValue = {
  description?: string;
  nsfw?: boolean;
  pub?: boolean;
  tags?: string[];
  invite?: string;
  updated: Date;
};

const GuildEditValueSchema = z.object({
  description: z.string().optional(),
  nsfw: z.boolean().optional(),
  pub: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  invite: z.string().optional(),
  updated: z.date(),
}) satisfies z.ZodType<GuildEditValue>;

const TWO_HOURS = 2 * 60 * 60;

export class GuildEdit extends ExpiringValue<GuildEditValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildEdit", TWO_HOURS, { schema: GuildEditValueSchema });
  }
}

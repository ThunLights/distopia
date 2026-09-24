import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildWhiteListEntry = {
  guildId: string;
  targetId: string;
  idType: "ChannelId" | "RoleId" | "UserId";
  allPermissions: boolean;
  permissions: "InviteLinkBlock"[];
  createdAt: Date;
  updatedAt: Date;
};

export type GuildWhiteListValue = {
  entries: GuildWhiteListEntry[];
  createdAt: Date;
};

const GuildWhiteListEntrySchema = z.object({
  guildId: z.string(),
  targetId: z.string(),
  idType: z.enum(["ChannelId", "RoleId", "UserId"]),
  allPermissions: z.boolean(),
  permissions: z.array(z.literal("InviteLinkBlock")),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<GuildWhiteListEntry>;

const GuildWhiteListValueSchema = z.compile(
  z.object({
    entries: z.array(GuildWhiteListEntrySchema),
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildWhiteListValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildWhiteList extends ExpiringValue<GuildWhiteListValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildWhiteList", TWELVE_HOURS, { schema: GuildWhiteListValueSchema });
  }
}

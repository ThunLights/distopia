import type { RedisClient } from "infra-redis";

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

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildWhiteList extends ExpiringValue<GuildWhiteListValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildWhiteList", TWELVE_HOURS);
  }
}

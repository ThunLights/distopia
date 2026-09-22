import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type FriendValue = {
  userId: string;
  username: string;
  description: string;
  nsfw: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatarUrl: string | null;
  tags: string[];
};

// No TTL -- repo-memory's original had no gc() at all.
export class Friend extends ExpiringValue<FriendValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "friend");
  }
}

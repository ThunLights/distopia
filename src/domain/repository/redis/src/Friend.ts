import type { RedisClient } from "infra-redis";
import z from "zod";

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

const FriendValueSchema = z.object({
  userId: z.string(),
  username: z.string(),
  description: z.string(),
  nsfw: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  avatarUrl: z.string().nullable(),
  tags: z.array(z.string()),
}) satisfies z.ZodType<FriendValue>;

// No TTL -- repo-memory's original had no gc() at all.
export class Friend extends ExpiringValue<FriendValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "friend", undefined, { schema: FriendValueSchema });
  }
}

import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type UserOAuth2Value = {
  username: string;
  email?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  updatedAt: Date;
};

const UserOAuth2ValueSchema = z.object({
  username: z.string(),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  updatedAt: z.date(),
}) satisfies z.ZodType<UserOAuth2Value>;

const TEN_MINUTES = 10 * 60;

export class UserOAuth2 extends ExpiringValue<UserOAuth2Value> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "userOAuth2", TEN_MINUTES, { schema: UserOAuth2ValueSchema });
  }
}

import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type UserOAuth2Value = {
  username: string;
  email?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  updatedAt: Date;
};

const TEN_MINUTES = 10 * 60;

export class UserOAuth2 extends ExpiringValue<UserOAuth2Value> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "userOAuth2", TEN_MINUTES);
  }
}

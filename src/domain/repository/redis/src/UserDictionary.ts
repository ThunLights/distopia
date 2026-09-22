import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type UserDictionaryEntry = {
  userId: string;
  word: string;
  reading: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDictionaryValue = {
  entries: UserDictionaryEntry[];
  createdAt: Date;
};

const TWELVE_HOURS = 12 * 60 * 60;

export class UserDictionary extends ExpiringValue<UserDictionaryValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "userDictionary", TWELVE_HOURS);
  }
}

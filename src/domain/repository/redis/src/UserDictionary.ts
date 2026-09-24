import type { RedisClient } from "infra-redis";
import z from "zod";

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

const UserDictionaryEntrySchema = z.object({
  userId: z.string(),
  word: z.string(),
  reading: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<UserDictionaryEntry>;

const UserDictionaryValueSchema = z.compile(
  z.object({
    entries: z.array(UserDictionaryEntrySchema),
    createdAt: z.date(),
  }) satisfies z.ZodType<UserDictionaryValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class UserDictionary extends ExpiringValue<UserDictionaryValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "userDictionary", TWELVE_HOURS, { schema: UserDictionaryValueSchema });
  }
}

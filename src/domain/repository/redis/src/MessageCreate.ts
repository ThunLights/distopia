import type { RedisClient } from "infra-redis";

import { RedisHashMap } from "./RedisHashMap";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type MessageCreateValue = {
  messageLens: number[];
  updatedAt: Date;
};

export class MessageCreate extends RedisHashMap<MessageCreateValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "messageCreate", { reset: true });
  }
}

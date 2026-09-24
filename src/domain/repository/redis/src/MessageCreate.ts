import type { RedisClient } from "infra-redis";
import z from "zod";

import { RedisHashMap } from "./RedisHashMap";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type MessageCreateValue = {
  messageLens: number[];
  updatedAt: Date;
};

const MessageCreateValueSchema = z.object({
  messageLens: z.array(z.number()),
  updatedAt: z.date(),
}) satisfies z.ZodType<MessageCreateValue>;

export class MessageCreate extends RedisHashMap<MessageCreateValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "messageCreate", { reset: true, schema: MessageCreateValueSchema });
  }
}

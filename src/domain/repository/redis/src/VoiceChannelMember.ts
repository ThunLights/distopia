import type { RedisClient } from "infra-redis";
import z from "zod";

import { RedisHashMap } from "./RedisHashMap";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type VoiceChannelMemberValue = {
  memberCounts: number[];
};

const VoiceChannelMemberValueSchema = z.compile(
  z.object({
    memberCounts: z.array(z.number()),
  }) satisfies z.ZodType<VoiceChannelMemberValue>,
);

// Bounded rolling sample buffer, not TTL'd. VoiceChannel.update() reads this right after
// pushing this cycle's sample and averages it into `plusPoint`, so the newest sample must
// always survive the trim -- slice(-MAX_SAMPLES) keeps the most recent 40, not the first 40
// ever recorded (which, once the buffer filled, would freeze `plusPoint` forever by dropping
// every sample pushed after that point).
const MAX_SAMPLES = 40;

export class VoiceChannelMember extends RedisHashMap<VoiceChannelMemberValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "voiceChannelMember", { schema: VoiceChannelMemberValueSchema });
  }

  public async pushMemberCounts(guildId: string, num: number): Promise<void> {
    const data = await this.get(guildId);
    const memberCounts = data?.memberCounts ? [...data.memberCounts, num] : [num];
    await this.set(guildId, { memberCounts: memberCounts.slice(-MAX_SAMPLES) });
  }
}

import type { RedisClient } from "infra-redis";
import z from "zod";

import { RedisHashMap } from "./RedisHashMap";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type VoiceChannelMemberValue = {
  memberCounts: number[];
};

const VoiceChannelMemberValueSchema = z.object({
  memberCounts: z.array(z.number()),
}) satisfies z.ZodType<VoiceChannelMemberValue>;

// Bounded rolling sample buffer, not TTL'd -- repo-memory's original gc() only capped array
// length (slice(0, 40)), it never expired entries by age. Applying that same cap inline on
// every push (rather than waiting for a periodic gc sweep, which nothing here replicates for
// Redis) keeps the exact same end state: at most 40 samples, oldest-40-wins.
const MAX_SAMPLES = 40;

export class VoiceChannelMember extends RedisHashMap<VoiceChannelMemberValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "voiceChannelMember", { schema: VoiceChannelMemberValueSchema });
  }

  public async pushMemberCounts(guildId: string, num: number): Promise<void> {
    const data = await this.get(guildId);
    const memberCounts = data?.memberCounts ? [...data.memberCounts, num] : [num];
    await this.set(guildId, { memberCounts: memberCounts.slice(0, MAX_SAMPLES) });
  }
}

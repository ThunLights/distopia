import type { RedisClient } from "infra-redis";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type TtsSynthesisCacheValue = {
  audio: Buffer;
  createdAt: Date;
};

type EncodedTtsSynthesisCacheValue = {
  audio: string;
  createdAt: string;
};

// 1-hour TTL matches the old TtsSynthesisCache.gc() cutoff; Redis's own EX replaces both
// that sweep and the old override on get() that treated an expired-but-not-yet-gc'd entry as
// a miss -- an expired key here simply won't exist anymore.
const TTL_SECONDS = 60 * 60;

export class TtsSynthesisCache extends ExpiringValue<TtsSynthesisCacheValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    // Deliberately not { reset: true } -- synthesized audio is expensive to regenerate and
    // losing it on every deploy would force a re-synthesis storm for no correctness benefit
    // (the 1h TTL above already bounds staleness).
    super(redis, owner, "ttsSynthesisCache", TTL_SECONDS);
  }

  // Redis strings are text -- audio is stored base64-encoded rather than JSON.stringify'd
  // directly (which would serialize a Buffer as {"type":"Buffer","data":[...]}, far larger
  // and not what JSON.parse hands back without a custom reviver).
  protected override encode(value: TtsSynthesisCacheValue): string {
    return JSON.stringify({
      audio: value.audio.toString("base64"),
      createdAt: value.createdAt.toISOString(),
    } satisfies EncodedTtsSynthesisCacheValue);
  }

  protected override decode(raw: string): TtsSynthesisCacheValue {
    const parsed = JSON.parse(raw) as EncodedTtsSynthesisCacheValue;
    return { audio: Buffer.from(parsed.audio, "base64"), createdAt: new Date(parsed.createdAt) };
  }
}

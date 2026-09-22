import type { RedisClient } from "infra-redis";

export type EphemeralMemoryOwner = "web" | "bot";

const SCAN_COUNT = 100;

// Reproduces "fresh Map on every process start" for repo-memory stores migrated to Redis --
// each owning service calls this once at boot, before serving traffic, so a stale entry from
// a previous version never survives a redeploy, same as it didn't when these lived in an
// in-process Map. Scoped to `<owner>:ephemeral:*` only -- stores opt into this namespace by
// passing `{ reset: true }` at construction (see ExpiringValueOptions); everything else (the
// read-through caches over Postgres/Discord, plus `tts:voice-session:*`, which is
// deliberately persistent -- see Tts.saveVoiceSession) lives outside it and survives a
// redeploy untouched. Uses SCAN, not KEYS, so it never blocks Redis even if a namespace grows
// large.
export async function resetEphemeralMemory(
  redis: RedisClient,
  owner: EphemeralMemoryOwner,
): Promise<number> {
  let cursor = "0";
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      `${owner}:ephemeral:*`,
      "COUNT",
      SCAN_COUNT,
    );
    cursor = nextCursor;

    for (const key of keys) {
      await redis.del(key);
      deleted++;
    }
  } while (cursor !== "0");

  return deleted;
}

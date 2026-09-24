import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { TtsSynthesisCache } from "./TtsSynthesisCache";

function fakeRedis(overrides: Partial<RedisClient> = {}): RedisClient {
  return {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    scan: vi.fn(),
    expire: vi.fn(),
    hset: vi.fn(),
    hget: vi.fn(),
    hgetall: vi.fn(),
    hdel: vi.fn(),
    ...overrides,
  } as RedisClient;
}

describe("TtsSynthesisCache", () => {
  test("set() base64-encodes the audio buffer and stores it with a 1-hour TTL", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    const cache = new TtsSynthesisCache(fakeRedis({ set }), "bot");
    const createdAt = new Date("2024-06-01T12:00:00.000Z");

    await cache.set("voicevox:1:hello", { audio: Buffer.from("audio-bytes"), createdAt });

    expect(set).toHaveBeenCalledWith(
      "bot:ttsSynthesisCache:voicevox:1:hello",
      JSON.stringify({ audio: Buffer.from("audio-bytes").toString("base64"), createdAt }),
      "EX",
      60 * 60,
    );
  });

  test("get() returns undefined for a missing/expired key", async () => {
    const cache = new TtsSynthesisCache(fakeRedis({ get: vi.fn().mockResolvedValue(null) }), "bot");

    expect(await cache.get("missing")).toBeUndefined();
  });

  test("get() round-trips the audio buffer exactly", async () => {
    const audio = Buffer.from([0, 1, 2, 255, 254]);
    const createdAt = new Date("2024-06-01T12:00:00.000Z");
    const cache = new TtsSynthesisCache(
      fakeRedis({
        get: vi
          .fn()
          .mockResolvedValue(JSON.stringify({ audio: audio.toString("base64"), createdAt })),
      }),
      "bot",
    );

    const result = await cache.get("voicevox:1:hello");

    expect(result?.audio).toEqual(audio);
    expect(result?.createdAt).toEqual(createdAt);
  });
});

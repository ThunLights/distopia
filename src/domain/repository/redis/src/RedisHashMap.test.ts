import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { RedisHashMap } from "./RedisHashMap";

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

type Value = { memberCounts: number[] };
type ValueWithDate = { memberIds: string[]; updatedAt: Date };

describe("RedisHashMap", () => {
  test("set() writes a JSON-encoded field under the owner:store hash key", async () => {
    const hset = vi.fn().mockResolvedValue(1);
    const map = new RedisHashMap<Value>(fakeRedis({ hset }), "bot", "voiceChannelMember");

    await map.set("guild-1", { memberCounts: [1, 2, 3] });

    expect(hset).toHaveBeenCalledWith(
      "bot:voiceChannelMember",
      "guild-1",
      JSON.stringify({ memberCounts: [1, 2, 3] }),
    );
  });

  test("get() returns undefined for a missing field", async () => {
    const map = new RedisHashMap<Value>(
      fakeRedis({ hget: vi.fn().mockResolvedValue(null) }),
      "bot",
      "voiceChannelMember",
    );

    expect(await map.get("missing")).toBeUndefined();
  });

  test("get() decodes a stored field", async () => {
    const map = new RedisHashMap<Value>(
      fakeRedis({ hget: vi.fn().mockResolvedValue(JSON.stringify({ memberCounts: [5] })) }),
      "bot",
      "voiceChannelMember",
    );

    expect(await map.get("guild-1")).toEqual({ memberCounts: [5] });
  });

  test("entries() decodes every field in the hash", async () => {
    const hgetall = vi.fn().mockResolvedValue({
      "guild-1": JSON.stringify({ memberCounts: [1] }),
      "guild-2": JSON.stringify({ memberCounts: [2, 3] }),
    });
    const map = new RedisHashMap<Value>(fakeRedis({ hgetall }), "bot", "voiceChannelMember");

    const result = await map.entries();

    expect(result).toEqual([
      ["guild-1", { memberCounts: [1] }],
      ["guild-2", { memberCounts: [2, 3] }],
    ]);
  });

  test("delete() removes only the given field", async () => {
    const hdel = vi.fn().mockResolvedValue(1);
    const map = new RedisHashMap<Value>(fakeRedis({ hdel }), "bot", "voiceChannelMember");

    await map.delete("guild-1");

    expect(hdel).toHaveBeenCalledWith("bot:voiceChannelMember", "guild-1");
  });

  test("clear() deletes the whole hash key", async () => {
    const del = vi.fn().mockResolvedValue(1);
    const map = new RedisHashMap<Value>(fakeRedis({ del }), "bot", "messageCreate");

    await map.clear();

    expect(del).toHaveBeenCalledWith("bot:messageCreate");
  });

  test("get() revives an updatedAt field as a Date instance, not a string", async () => {
    const updatedAt = new Date("2024-06-01T12:00:00.000Z");
    const map = new RedisHashMap<ValueWithDate>(
      fakeRedis({
        hget: vi.fn().mockResolvedValue(JSON.stringify({ memberIds: ["u1"], updatedAt })),
      }),
      "bot",
      "guildMemberAdd",
    );

    const result = await map.get("guild-1");

    expect(result?.updatedAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toEqual(updatedAt);
  });

  test("{ reset: true } namespaces the hash key under <owner>:ephemeral:<store>", async () => {
    const hget = vi.fn().mockResolvedValue(null);
    const map = new RedisHashMap<Value>(fakeRedis({ hget }), "bot", "voiceChannelMember", {
      reset: true,
    });

    await map.get("guild-1");

    expect(hget).toHaveBeenCalledWith("bot:ephemeral:voiceChannelMember", "guild-1");
  });
});

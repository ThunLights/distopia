import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { ExpiringDate } from "./ExpiringDate";

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
    ...overrides,
  } as RedisClient;
}

describe("ExpiringDate", () => {
  test("set() stores the expiry ISO string with a TTL matching its remaining lifetime", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:00:00.000Z"));

    const set = vi.fn().mockResolvedValue("OK");
    const store = new ExpiringDate(fakeRedis({ set }), "bot", "ratelimit:button");

    const limit = new Date("2024-06-01T12:00:00.500Z"); // 500ms out
    await store.set("user-1", limit);

    expect(set).toHaveBeenCalledWith(
      "bot:ratelimit:button:user-1",
      limit.toISOString(),
      "EX",
      1, // ceil(500ms) -> 1s
    );

    vi.useRealTimers();
  });

  test("get() returns undefined when no limit is active", async () => {
    const store = new ExpiringDate(
      fakeRedis({ get: vi.fn().mockResolvedValue(null) }),
      "bot",
      "ratelimit:button",
    );

    expect(await store.get("user-1")).toBeUndefined();
  });

  test("get() returns the stored expiry as a Date", async () => {
    const iso = "2024-06-01T12:00:00.500Z";
    const store = new ExpiringDate(
      fakeRedis({ get: vi.fn().mockResolvedValue(iso) }),
      "bot",
      "ratelimit:chatInputCommand",
    );

    const result = await store.get("user-1");

    expect(result).toEqual(new Date(iso));
  });

  test("keys are namespaced by owner and store", async () => {
    const get = vi.fn().mockResolvedValue(null);
    const store = new ExpiringDate(fakeRedis({ get }), "bot", "ratelimit:bump");

    await store.get("guild-1");

    expect(get).toHaveBeenCalledWith("bot:ratelimit:bump:guild-1");
  });

  test("delete() removes the key", async () => {
    const del = vi.fn().mockResolvedValue(1);
    const store = new ExpiringDate(fakeRedis({ del }), "bot", "unJoinedGuild");

    await store.delete("guild-1");

    expect(del).toHaveBeenCalledWith("bot:unJoinedGuild:guild-1");
  });

  test("{ reset: true } namespaces the key under <owner>:ephemeral:<store>", async () => {
    const get = vi.fn().mockResolvedValue(null);
    const store = new ExpiringDate(fakeRedis({ get }), "bot", "ratelimit:button", {
      reset: true,
    });

    await store.get("user-1");

    expect(get).toHaveBeenCalledWith("bot:ephemeral:ratelimit:button:user-1");
  });
});

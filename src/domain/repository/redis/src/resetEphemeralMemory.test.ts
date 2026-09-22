import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { resetEphemeralMemory } from "./resetEphemeralMemory";

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

describe("resetEphemeralMemory", () => {
  test("deletes every key scanned under the owner's ephemeral prefix", async () => {
    const scan = vi
      .fn()
      .mockResolvedValueOnce([
        "0",
        ["web:ephemeral:ratelimit:button:a", "web:ephemeral:ratelimit:button:b"],
      ]);
    const del = vi.fn().mockResolvedValue(1);

    const deleted = await resetEphemeralMemory(fakeRedis({ scan, del }), "web");

    expect(scan).toHaveBeenCalledWith("0", "MATCH", "web:ephemeral:*", "COUNT", 100);
    expect(del).toHaveBeenCalledWith("web:ephemeral:ratelimit:button:a");
    expect(del).toHaveBeenCalledWith("web:ephemeral:ratelimit:button:b");
    expect(deleted).toBe(2);
  });

  test("follows a non-zero cursor across multiple SCAN pages", async () => {
    const scan = vi
      .fn()
      .mockResolvedValueOnce(["17", ["web:ephemeral:a"]])
      .mockResolvedValueOnce(["0", ["web:ephemeral:b"]]);
    const del = vi.fn().mockResolvedValue(1);

    const deleted = await resetEphemeralMemory(fakeRedis({ scan, del }), "web");

    expect(scan).toHaveBeenNthCalledWith(1, "0", "MATCH", "web:ephemeral:*", "COUNT", 100);
    expect(scan).toHaveBeenNthCalledWith(2, "17", "MATCH", "web:ephemeral:*", "COUNT", 100);
    expect(deleted).toBe(2);
  });

  test("scopes SCAN to the given owner's ephemeral prefix only", async () => {
    const scan = vi.fn().mockResolvedValueOnce(["0", []]);

    await resetEphemeralMemory(fakeRedis({ scan }), "bot");

    expect(scan).toHaveBeenCalledWith("0", "MATCH", "bot:ephemeral:*", "COUNT", 100);
  });

  test("returns 0 and deletes nothing when no keys match", async () => {
    const scan = vi.fn().mockResolvedValueOnce(["0", []]);
    const del = vi.fn();

    const deleted = await resetEphemeralMemory(fakeRedis({ scan, del }), "web");

    expect(del).not.toHaveBeenCalled();
    expect(deleted).toBe(0);
  });
});

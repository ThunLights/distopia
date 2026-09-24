import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { GuildEdit } from "./GuildEdit";

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

describe("GuildEdit", () => {
  // Regression test for the schema's `updated` field: it isn't named createdAt/updatedAt, so
  // ExpiringValue's reviveDates never turns it back into a Date on decode -- a plain z.date()
  // schema would reject every stored value (see the schema's own comment).
  test("set() then get() round-trips a value, reviving `updated` as a Date", async () => {
    let stored: string | null = null;
    const store = new GuildEdit(
      fakeRedis({
        set: vi.fn().mockImplementation(async (_key, value) => {
          stored = value as string;
          return "OK";
        }),
        get: vi.fn().mockImplementation(async () => stored),
      }),
      "bot",
    );

    const updated = new Date("2024-06-01T12:00:00.000Z");
    await store.set("guild-1", { description: "new description", updated });

    const result = await store.get("guild-1");

    expect(result?.updated).toBeInstanceOf(Date);
    expect(result).toEqual({ description: "new description", updated });
  });
});

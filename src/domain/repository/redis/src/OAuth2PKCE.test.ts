import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { OAuth2PKCE } from "./OAuth2PKCE";

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

describe("OAuth2PKCE", () => {
  test("set() stores the value JSON-encoded with a 20-minute TTL", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    const pkce = new OAuth2PKCE(fakeRedis({ set }));

    const createdAt = new Date("2024-06-01T12:00:00.000Z");
    await pkce.set("session-1", { sessionKey: "key-1", createdAt });

    expect(set).toHaveBeenCalledWith(
      "web:ephemeral:oauth2pkce:session-1",
      JSON.stringify({ sessionKey: "key-1", createdAt }),
      "EX",
      20 * 60,
    );
  });

  test("get() returns undefined for a missing/expired key", async () => {
    const pkce = new OAuth2PKCE(fakeRedis({ get: vi.fn().mockResolvedValue(null) }));

    expect(await pkce.get("missing")).toBeUndefined();
  });

  test("get() round-trips a stored value, reviving createdAt as a Date", async () => {
    const createdAt = new Date("2024-06-01T12:00:00.000Z");
    const pkce = new OAuth2PKCE(
      fakeRedis({
        get: vi.fn().mockResolvedValue(JSON.stringify({ sessionKey: "key-1", createdAt })),
      }),
    );

    const result = await pkce.get("session-1");

    expect(result).toEqual({ sessionKey: "key-1", createdAt });
    expect(result?.createdAt).toBeInstanceOf(Date);
  });

  test("delete() removes the key", async () => {
    const del = vi.fn().mockResolvedValue(1);
    const pkce = new OAuth2PKCE(fakeRedis({ del }));

    await pkce.delete("session-1");

    expect(del).toHaveBeenCalledWith("web:ephemeral:oauth2pkce:session-1");
  });
});

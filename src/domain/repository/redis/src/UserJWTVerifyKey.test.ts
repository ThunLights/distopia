import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { UserJWTVerifyKey } from "./UserJWTVerifyKey";

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

describe("UserJWTVerifyKey", () => {
  test("set() stores the key base64-encoded, with no TTL", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    const store = new UserJWTVerifyKey(fakeRedis({ set }), "web");

    await store.set("user-1", new Uint8Array([1, 2, 3]));

    expect(set).toHaveBeenCalledWith(
      "web:userJWTVerifyKey:user-1",
      Buffer.from([1, 2, 3]).toString("base64"),
    );
    expect(set).toHaveBeenCalledTimes(1);
  });

  test("get() returns undefined for a missing key", async () => {
    const store = new UserJWTVerifyKey(fakeRedis({ get: vi.fn().mockResolvedValue(null) }), "web");

    expect(await store.get("missing")).toBeUndefined();
  });

  test("get() round-trips the bytes exactly", async () => {
    const bytes = new Uint8Array([9, 8, 7, 255]);
    const store = new UserJWTVerifyKey(
      fakeRedis({ get: vi.fn().mockResolvedValue(Buffer.from(bytes).toString("base64")) }),
      "web",
    );

    // Returned as a Buffer, not a plain Uint8Array -- both are valid Uint8Array<ArrayBuffer>
    // instances (Buffer subclasses it) and behave identically for JWT.ts's callers, but
    // vitest's toEqual treats the two constructors as distinct, so compare byte contents.
    expect(Array.from((await store.get("user-1"))!)).toEqual(Array.from(bytes));
  });
});

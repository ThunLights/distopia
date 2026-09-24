import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { JWTKey } from "./JWTKey";

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

describe("JWTKey", () => {
  test("set() base64-encodes the key buffer under a numeric field on the owner's hash", async () => {
    const hset = vi.fn().mockResolvedValue(1);
    const store = new JWTKey(fakeRedis({ hset }), "web");
    const createdAt = new Date("2024-06-01T12:00:00.000Z");

    await store.set(7, { alg: "HS256", key: Buffer.from("secret-key"), createdAt });

    expect(hset).toHaveBeenCalledWith(
      "web:jwtKey",
      "7",
      JSON.stringify({
        alg: "HS256",
        key: Buffer.from("secret-key").toString("base64"),
        createdAt,
      }),
    );
  });

  test("get() returns undefined for a missing key id", async () => {
    const store = new JWTKey(fakeRedis({ hget: vi.fn().mockResolvedValue(null) }), "web");

    expect(await store.get(1)).toBeUndefined();
  });

  test("get() round-trips the key buffer exactly", async () => {
    const key = Buffer.from([1, 2, 3, 255]);
    const createdAt = new Date("2024-06-01T12:00:00.000Z");
    const store = new JWTKey(
      fakeRedis({
        hget: vi
          .fn()
          .mockResolvedValue(
            JSON.stringify({ alg: "HS256", key: key.toString("base64"), createdAt }),
          ),
      }),
      "web",
    );

    const result = await store.get(7);

    expect(result?.key).toEqual(key);
    expect(result?.alg).toBe("HS256");
  });

  test("entries() decodes every field, parsing hash field names back to numbers", async () => {
    const createdAt = new Date("2024-06-01T12:00:00.000Z");
    const hgetall = vi.fn().mockResolvedValue({
      "1": JSON.stringify({ alg: "HS256", key: Buffer.from("a").toString("base64"), createdAt }),
      "2": JSON.stringify({ alg: "HS256", key: Buffer.from("b").toString("base64"), createdAt }),
    });
    const store = new JWTKey(fakeRedis({ hgetall }), "web");

    const result = await store.entries();

    expect(result.map(([id]) => id)).toEqual([1, 2]);
    expect(result.every(([, value]) => value.key instanceof Buffer)).toBe(true);
  });

  test("delete() removes only the given key id", async () => {
    const hdel = vi.fn().mockResolvedValue(1);
    const store = new JWTKey(fakeRedis({ hdel }), "web");

    await store.delete(7);

    expect(hdel).toHaveBeenCalledWith("web:jwtKey", "7");
  });

  // JWTKey overrides decode() (base64 <-> Buffer) rather than using RedisHashMap's default
  // JSON.parse -- confirms schema validation still runs on its output, e.g. an "alg" a
  // rolling update's other pod version no longer signs with.
  test("get() logs and returns undefined for a persisted key with an unrecognized alg", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = new JWTKey(
      fakeRedis({
        hget: vi.fn().mockResolvedValue(
          JSON.stringify({
            alg: "RS256",
            key: Buffer.from("secret-key").toString("base64"),
            createdAt: new Date("2024-06-01T12:00:00.000Z"),
          }),
        ),
      }),
      "web",
    );

    expect(await store.get(7)).toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("failed schema validation"),
      expect.anything(),
    );
    consoleError.mockRestore();
  });
});

import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";

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

type Value = { username: string };
type ValueWithDates = { username: string; createdAt: Date; updatedAt: Date };

describe("ExpiringValue", () => {
  test("set() stores the value JSON-encoded with the configured TTL", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    const store = new ExpiringValue<Value>(fakeRedis({ set }), "web", "userOAuth2", 600);

    await store.set("user-1", { username: "alice" });

    expect(set).toHaveBeenCalledWith(
      "web:userOAuth2:user-1",
      JSON.stringify({ username: "alice" }),
      "EX",
      600,
    );
  });

  test("get() returns undefined for a missing/expired key", async () => {
    const store = new ExpiringValue<Value>(
      fakeRedis({ get: vi.fn().mockResolvedValue(null) }),
      "web",
      "userOAuth2",
      600,
    );

    expect(await store.get("missing")).toBeUndefined();
  });

  test("get() decodes a stored value", async () => {
    const store = new ExpiringValue<Value>(
      fakeRedis({ get: vi.fn().mockResolvedValue(JSON.stringify({ username: "bob" })) }),
      "web",
      "userOAuth2",
      600,
    );

    expect(await store.get("user-1")).toEqual({ username: "bob" });
  });

  test("delete() removes the key", async () => {
    const del = vi.fn().mockResolvedValue(1);
    const store = new ExpiringValue<Value>(fakeRedis({ del }), "web", "userOAuth2", 600);

    await store.delete("user-1");

    expect(del).toHaveBeenCalledWith("web:userOAuth2:user-1");
  });

  test("keys are namespaced by owner and store", async () => {
    const get = vi.fn().mockResolvedValue(null);
    const store = new ExpiringValue<Value>(fakeRedis({ get }), "bot", "oauth2Guilds", 300);

    await store.get("user-1");

    expect(get).toHaveBeenCalledWith("bot:oauth2Guilds:user-1");
  });

  test("set() omits EX entirely when constructed without a TTL", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    const store = new ExpiringValue<Value>(fakeRedis({ set }), "bot", "friend");

    await store.set("user-1", { username: "alice" });

    expect(set).toHaveBeenCalledWith("bot:friend:user-1", JSON.stringify({ username: "alice" }));
    expect(set).toHaveBeenCalledTimes(1);
  });

  test("get() revives createdAt/updatedAt fields as Date instances, not strings", async () => {
    const createdAt = new Date("2024-06-01T12:00:00.000Z");
    const updatedAt = new Date("2024-06-02T08:30:00.000Z");
    const store = new ExpiringValue<ValueWithDates>(
      fakeRedis({
        get: vi.fn().mockResolvedValue(JSON.stringify({ username: "bob", createdAt, updatedAt })),
      }),
      "web",
      "userOAuth2",
      600,
    );

    const result = await store.get("user-1");

    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toBeInstanceOf(Date);
    expect(result?.createdAt).toEqual(createdAt);
    expect(result?.updatedAt).toEqual(updatedAt);
  });

  test("{ reset: true } namespaces the key under <owner>:ephemeral:<store>", async () => {
    const get = vi.fn().mockResolvedValue(null);
    const store = new ExpiringValue<Value>(fakeRedis({ get }), "bot", "oauth2Guilds", 300, {
      reset: true,
    });

    await store.get("user-1");

    expect(get).toHaveBeenCalledWith("bot:ephemeral:oauth2Guilds:user-1");
  });

  describe("schema", () => {
    const schema = z.object({ username: z.string() });

    test("get() returns the value when it matches the schema", async () => {
      const store = new ExpiringValue<Value>(
        fakeRedis({ get: vi.fn().mockResolvedValue(JSON.stringify({ username: "bob" })) }),
        "web",
        "userOAuth2",
        600,
        { schema },
      );

      expect(await store.get("user-1")).toEqual({ username: "bob" });
    });

    // Reproduces a rolling update's old/new pod overlap: a value written under a schema a
    // still-running old pod no longer recognizes (a field renamed/dropped/retyped) must not
    // reach the caller as a wrong-shaped object, and must not throw mid-request either.
    test("get() logs and returns undefined for a value that no longer matches the schema", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = new ExpiringValue<Value>(
        fakeRedis({ get: vi.fn().mockResolvedValue(JSON.stringify({ displayName: "bob" })) }),
        "web",
        "userOAuth2",
        600,
        { schema },
      );

      const result = await store.get("user-1");

      expect(result).toBeUndefined();
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("failed schema validation"),
        expect.anything(),
      );
      consoleError.mockRestore();
    });

    test("get() logs and returns undefined for a value that isn't valid JSON", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const store = new ExpiringValue<Value>(
        fakeRedis({ get: vi.fn().mockResolvedValue("not json") }),
        "web",
        "userOAuth2",
        600,
        { schema },
      );

      const result = await store.get("user-1");

      expect(result).toBeUndefined();
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("failed to decode"),
        expect.anything(),
      );
      consoleError.mockRestore();
    });

    test("get() skips validation entirely when no schema is configured", async () => {
      const store = new ExpiringValue<Value>(
        fakeRedis({ get: vi.fn().mockResolvedValue(JSON.stringify({ anything: "goes" })) }),
        "web",
        "userOAuth2",
        600,
      );

      expect(await store.get("user-1")).toEqual({ anything: "goes" });
    });
  });
});

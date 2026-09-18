import { describe, expect, test, vi } from "vitest";

// vi.mock's factory is hoisted above this file's other statements, so the fake class must be
// declared via vi.hoisted rather than a plain top-level const/class the factory could close
// over before it's initialized.
const { FakeRedis, constructedUrls } = vi.hoisted(() => {
  const constructedUrls: string[] = [];
  class FakeRedis {
    public url: string;
    public listeners = new Map<string, (...args: unknown[]) => void>();
    constructor(url: string) {
      this.url = url;
      constructedUrls.push(url);
    }
    on(event: string, listener: (...args: unknown[]) => void) {
      this.listeners.set(event, listener);
      return this;
    }
  }
  return { FakeRedis, constructedUrls };
});
vi.mock("ioredis", () => ({ default: FakeRedis }));

import { createRedisClient } from "./index";

describe("createRedisClient", () => {
  test("constructs ioredis with the given URL and returns it unmodified", () => {
    const client = createRedisClient("redis://localhost:6379");

    expect(constructedUrls).toEqual(["redis://localhost:6379"]);
    expect(client).toBeInstanceOf(FakeRedis);
    expect((client as unknown as InstanceType<typeof FakeRedis>).url).toBe(
      "redis://localhost:6379",
    );
  });

  test("registers an error listener so a connection failure never crashes as unhandled", () => {
    const client = createRedisClient("redis://localhost:6379") as unknown as InstanceType<
      typeof FakeRedis
    >;

    expect(client.listeners.has("error")).toBe(true);
  });
});

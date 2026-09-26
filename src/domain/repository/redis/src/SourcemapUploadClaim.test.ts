import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { claimSourcemapUpload, releaseSourcemapUploadClaim } from "./SourcemapUploadClaim";

const THIRTY_DAYS = 30 * 24 * 60 * 60;

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

describe("claimSourcemapUpload", () => {
  test("claims the first time a GIT_SHA is seen", async () => {
    const set = vi.fn().mockResolvedValue("OK");

    const claimed = await claimSourcemapUpload(fakeRedis({ set }), "web", "abc123");

    expect(set).toHaveBeenCalledWith(
      "web:sourcemaps-uploaded:abc123",
      "1",
      "EX",
      THIRTY_DAYS,
      "NX",
    );
    expect(claimed).toBe(true);
  });

  test("does not claim when another pod already uploaded this GIT_SHA", async () => {
    const set = vi.fn().mockResolvedValue(null);

    const claimed = await claimSourcemapUpload(fakeRedis({ set }), "web", "abc123");

    expect(claimed).toBe(false);
  });

  test("scopes the claim key to the given owner", async () => {
    const set = vi.fn().mockResolvedValue("OK");

    await claimSourcemapUpload(fakeRedis({ set }), "bot", "abc123");

    expect(set).toHaveBeenCalledWith(
      "bot:sourcemaps-uploaded:abc123",
      "1",
      "EX",
      THIRTY_DAYS,
      "NX",
    );
  });
});

describe("releaseSourcemapUploadClaim", () => {
  test("deletes the claim key so a later attempt can retry", async () => {
    const del = vi.fn().mockResolvedValue(1);

    await releaseSourcemapUploadClaim(fakeRedis({ del }), "web", "abc123");

    expect(del).toHaveBeenCalledWith("web:sourcemaps-uploaded:abc123");
  });
});

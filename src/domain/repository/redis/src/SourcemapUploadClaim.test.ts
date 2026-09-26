import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import {
  claimSourcemapUpload,
  markSourcemapUploadDone,
  releaseSourcemapUploadClaim,
} from "./SourcemapUploadClaim";

const CLAIM_TTL = 10 * 60;
const DONE_TTL = 30 * 24 * 60 * 60;

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
  test("claims the first time a GIT_SHA is seen, with a short TTL", async () => {
    const set = vi.fn().mockResolvedValue("OK");

    const claimed = await claimSourcemapUpload(fakeRedis({ set }), "web", "abc123");

    expect(set).toHaveBeenCalledWith("web:sourcemaps-uploaded:abc123", "1", "EX", CLAIM_TTL, "NX");
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

    expect(set).toHaveBeenCalledWith("bot:sourcemaps-uploaded:abc123", "1", "EX", CLAIM_TTL, "NX");
  });
});

describe("markSourcemapUploadDone", () => {
  test("extends the claim's TTL out to DONE_TTL", async () => {
    const expire = vi.fn().mockResolvedValue(1);

    await markSourcemapUploadDone(fakeRedis({ expire }), "web", "abc123");

    expect(expire).toHaveBeenCalledWith("web:sourcemaps-uploaded:abc123", DONE_TTL);
  });
});

describe("releaseSourcemapUploadClaim", () => {
  test("deletes the claim key so a later attempt can retry immediately", async () => {
    const del = vi.fn().mockResolvedValue(1);

    await releaseSourcemapUploadClaim(fakeRedis({ del }), "web", "abc123");

    expect(del).toHaveBeenCalledWith("web:sourcemaps-uploaded:abc123");
  });
});

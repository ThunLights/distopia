import type { RedisClient } from "infra-redis";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { claimSourcemapUpload, releaseSourcemapUploadClaim } = vi.hoisted(() => ({
  claimSourcemapUpload: vi.fn(),
  releaseSourcemapUploadClaim: vi.fn(),
}));
const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));

vi.mock("repo-redis", () => ({ claimSourcemapUpload, releaseSourcemapUploadClaim }));
vi.mock("@sentry/cli", () => ({
  default: class {
    public execute = execute;
  },
}));
vi.mock("$env/dynamic/private", () => ({
  env: {
    SENTRY_AUTH_TOKEN: "token",
    SENTRY_ORG: "org",
    SENTRY_PROJECT: "project",
  },
}));

import { env } from "$env/dynamic/private";

import { uploadSourceMapsOnce } from "./sourcemaps";

function fakeRedis(): RedisClient {
  return {} as RedisClient;
}

describe("uploadSourceMapsOnce", () => {
  const originalGitSha = process.env.GIT_SHA;

  beforeEach(() => {
    process.env.GIT_SHA = "abc123";
    env.SENTRY_AUTH_TOKEN = "token";
    env.SENTRY_ORG = "org";
    env.SENTRY_PROJECT = "project";
    claimSourcemapUpload.mockReset().mockResolvedValue(true);
    releaseSourcemapUploadClaim.mockReset().mockResolvedValue(undefined);
    execute.mockReset().mockResolvedValue("");
  });

  afterEach(() => {
    process.env.GIT_SHA = originalGitSha;
  });

  test("uploads once claimed and never releases the claim", async () => {
    await uploadSourceMapsOnce(fakeRedis());

    expect(claimSourcemapUpload).toHaveBeenCalledWith(expect.anything(), "web", "abc123");
    expect(execute).toHaveBeenCalledWith(
      ["sourcemaps", "upload", expect.stringContaining("build/client"), expect.stringContaining("build/server")],
      "rejectOnError",
    );
    expect(releaseSourcemapUploadClaim).not.toHaveBeenCalled();
  });

  test("skips the upload when another pod already claimed this GIT_SHA", async () => {
    claimSourcemapUpload.mockResolvedValue(false);

    await uploadSourceMapsOnce(fakeRedis());

    expect(execute).not.toHaveBeenCalled();
  });

  test("skips entirely when GIT_SHA is the local-dev default", async () => {
    process.env.GIT_SHA = "unknown";

    await uploadSourceMapsOnce(fakeRedis());

    expect(claimSourcemapUpload).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  test("skips entirely when SENTRY_AUTH_TOKEN is not configured", async () => {
    env.SENTRY_AUTH_TOKEN = undefined;

    await uploadSourceMapsOnce(fakeRedis());

    expect(claimSourcemapUpload).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  test("releases the claim so a later attempt can retry when the upload fails", async () => {
    execute.mockRejectedValue(new Error("network error"));

    await uploadSourceMapsOnce(fakeRedis());

    expect(releaseSourcemapUploadClaim).toHaveBeenCalledWith(expect.anything(), "web", "abc123");
  });
});

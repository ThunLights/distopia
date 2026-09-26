import type { RedisClient } from "infra-redis";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { claimSourcemapUpload, markSourcemapUploadDone, releaseSourcemapUploadClaim } = vi.hoisted(
  () => ({
    claimSourcemapUpload: vi.fn(),
    markSourcemapUploadDone: vi.fn(),
    releaseSourcemapUploadClaim: vi.fn(),
  }),
);
const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));

vi.mock("repo-redis", () => ({
  claimSourcemapUpload,
  markSourcemapUploadDone,
  releaseSourcemapUploadClaim,
}));
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
    markSourcemapUploadDone.mockReset().mockResolvedValue(undefined);
    releaseSourcemapUploadClaim.mockReset().mockResolvedValue(undefined);
    execute.mockReset().mockResolvedValue("");
  });

  afterEach(() => {
    process.env.GIT_SHA = originalGitSha;
  });

  test("uploads once claimed, marks it done, and never releases the claim", async () => {
    await uploadSourceMapsOnce(fakeRedis());

    expect(claimSourcemapUpload).toHaveBeenCalledWith(expect.anything(), "web", "abc123");
    expect(execute).toHaveBeenCalledWith(
      [
        "sourcemaps",
        "upload",
        expect.stringContaining(".sourcemaps/client"),
        expect.stringContaining(".sourcemaps/server"),
      ],
      "rejectOnError",
    );
    expect(markSourcemapUploadDone).toHaveBeenCalledWith(expect.anything(), "web", "abc123");
    expect(releaseSourcemapUploadClaim).not.toHaveBeenCalled();
  });

  test("skips the upload when another pod already claimed this GIT_SHA", async () => {
    claimSourcemapUpload.mockResolvedValue(false);

    await uploadSourceMapsOnce(fakeRedis());

    expect(execute).not.toHaveBeenCalled();
    expect(releaseSourcemapUploadClaim).not.toHaveBeenCalled();
  });

  test("skips entirely when GIT_SHA is the local-dev default", async () => {
    process.env.GIT_SHA = "unknown";

    await uploadSourceMapsOnce(fakeRedis());

    expect(claimSourcemapUpload).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  test("skips entirely when SENTRY_AUTH_TOKEN is not configured", async () => {
    // $env/dynamic/private types env as Record<string, string> (never `| undefined`) --
    // Reflect.deleteProperty removes the key without fighting that type at the call site.
    Reflect.deleteProperty(env, "SENTRY_AUTH_TOKEN");

    await uploadSourceMapsOnce(fakeRedis());

    expect(claimSourcemapUpload).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  test("releases the claim so a later attempt can retry when the upload fails", async () => {
    execute.mockRejectedValue(new Error("network error"));

    await uploadSourceMapsOnce(fakeRedis());

    expect(releaseSourcemapUploadClaim).toHaveBeenCalledWith(expect.anything(), "web", "abc123");
    expect(markSourcemapUploadDone).not.toHaveBeenCalled();
  });

  test("never rejects, even when claimSourcemapUpload itself fails", async () => {
    claimSourcemapUpload.mockRejectedValue(new Error("redis unreachable"));

    await expect(uploadSourceMapsOnce(fakeRedis())).resolves.toBeUndefined();
    expect(releaseSourcemapUploadClaim).not.toHaveBeenCalled();
  });

  test("never rejects, even when releasing a failed claim also fails", async () => {
    execute.mockRejectedValue(new Error("network error"));
    releaseSourcemapUploadClaim.mockRejectedValue(new Error("redis unreachable"));

    await expect(uploadSourceMapsOnce(fakeRedis())).resolves.toBeUndefined();
  });
});

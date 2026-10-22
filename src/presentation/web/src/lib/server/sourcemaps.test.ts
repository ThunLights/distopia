import { uploadSourceMapsOnce } from "./sourcemaps";
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
const privateEnv = vi.hoisted(() => ({
  SENTRY_AUTH_TOKEN: "token",
  SENTRY_ORG: "org",
  SENTRY_PROJECT: "project",
}));

vi.mock("repo-redis", () => ({
  claimSourcemapUpload,
  markSourcemapUploadDone,
  releaseSourcemapUploadClaim,
}));
vi.mock("@sentry/cli", () => ({
  SentryCli: class {
    public execute = execute;
  },
}));
vi.mock("$app/env/private", () => ({
  get SENTRY_AUTH_TOKEN() {
    return privateEnv.SENTRY_AUTH_TOKEN;
  },
  get SENTRY_ORG() {
    return privateEnv.SENTRY_ORG;
  },
  get SENTRY_PROJECT() {
    return privateEnv.SENTRY_PROJECT;
  },
}));

function fakeRedis(): RedisClient {
  return {} as RedisClient;
}

describe("uploadSourceMapsOnce", () => {
  const originalGitSha = process.env.GIT_SHA;

  beforeEach(() => {
    process.env.GIT_SHA = "abc123";
    privateEnv.SENTRY_AUTH_TOKEN = "token";
    privateEnv.SENTRY_ORG = "org";
    privateEnv.SENTRY_PROJECT = "project";
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
      true,
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
    privateEnv.SENTRY_AUTH_TOKEN = "";

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

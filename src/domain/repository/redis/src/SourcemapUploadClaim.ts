import type { RedisClient } from "infra-redis";

import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

// Long enough that no realistic deploy cadence revisits the same GIT_SHA before it expires,
// short enough that Redis doesn't accumulate one key per historical build forever.
const THIRTY_DAYS = 30 * 24 * 60 * 60;

function key(owner: EphemeralMemoryOwner, gitSha: string): string {
  return `${owner}:sourcemaps-uploaded:${gitSha}`;
}

// Atomic "first pod to boot off this image wins" claim. A given GIT_SHA's build output (and
// its source maps) never changes once built, so only one pod ever needs to upload them to
// Sentry -- every sibling replica, and any later restart of the same image (crash loop, node
// drain, ...), sees the key already set and skips the upload entirely.
export async function claimSourcemapUpload(
  redis: RedisClient,
  owner: EphemeralMemoryOwner,
  gitSha: string,
): Promise<boolean> {
  const result = await redis.set(key(owner, gitSha), "1", "EX", THIRTY_DAYS, "NX");
  return result === "OK";
}

// Releases a claim after a failed upload, so the next pod restart (or another replica still
// coming up) gets to retry instead of this build's source maps silently never uploading.
export async function releaseSourcemapUploadClaim(
  redis: RedisClient,
  owner: EphemeralMemoryOwner,
  gitSha: string,
): Promise<void> {
  await redis.del(key(owner, gitSha));
}

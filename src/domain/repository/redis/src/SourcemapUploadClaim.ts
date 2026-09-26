import type { RedisClient } from "infra-redis";

import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

// The in-progress claim only needs to outlive one upload attempt -- kept short so a pod that
// dies mid-upload (OOM-killed, SIGKILLed during a RollingUpdate, node drain, ...) before it
// can call releaseSourcemapUploadClaim doesn't strand the claim for weeks with nobody left to
// retry it.
const CLAIM_TTL = 10 * 60;
// Once an upload actually succeeds, markSourcemapUploadDone extends the same key out to this:
// long enough that no realistic deploy cadence revisits the same GIT_SHA before it expires,
// short enough that Redis doesn't accumulate one key per historical build forever.
const DONE_TTL = 30 * 24 * 60 * 60;

function key(owner: EphemeralMemoryOwner, gitSha: string): string {
  return `${owner}:sourcemaps-uploaded:${gitSha}`;
}

// Atomic "first pod to boot off this image wins" claim. A given GIT_SHA's build output (and
// its source maps) never changes once built, so only one pod ever needs to upload them to
// Sentry -- every sibling replica, and any later restart of the same image (crash loop, node
// drain, ...), sees the key already set and skips the upload entirely. Starts with a short TTL
// (see markSourcemapUploadDone for what happens on success) so a pod that claims the upload and
// then dies before finishing it doesn't block every future attempt for CLAIM_TTL's remainder.
export async function claimSourcemapUpload(
  redis: RedisClient,
  owner: EphemeralMemoryOwner,
  gitSha: string,
): Promise<boolean> {
  const result = await redis.set(key(owner, gitSha), "1", "EX", CLAIM_TTL, "NX");
  return result === "OK";
}

// Extends a successful upload's claim from CLAIM_TTL out to DONE_TTL, so it actually sticks
// instead of expiring a few minutes later and letting some future pod re-upload the same
// build's source maps for no reason.
export async function markSourcemapUploadDone(
  redis: RedisClient,
  owner: EphemeralMemoryOwner,
  gitSha: string,
): Promise<void> {
  await redis.expire(key(owner, gitSha), DONE_TTL);
}

// Releases a claim after a failed upload, so the next pod restart (or another replica still
// coming up) gets to retry immediately instead of waiting out CLAIM_TTL.
export async function releaseSourcemapUploadClaim(
  redis: RedisClient,
  owner: EphemeralMemoryOwner,
  gitSha: string,
): Promise<void> {
  await redis.del(key(owner, gitSha));
}

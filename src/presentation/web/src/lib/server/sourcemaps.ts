import { env } from "$env/dynamic/private";
import SentryCli from "@sentry/cli";
import type { RedisClient } from "infra-redis";
import path from "node:path";
import { claimSourcemapUpload, releaseSourcemapUploadClaim } from "repo-redis";

// Source maps are generated at build time (vite.config.ts's sentrySvelteKit plugin still sets
// `build.sourcemap: "hidden"` and injects debug IDs), but SENTRY_AUTH_TOKEN is deliberately
// absent from the build -- see docker/dockerfile.prod and k8s/ci/workflowtemplate.yaml's
// prepare-env step. Without it, the plugin's own build-time upload attempt just warns and
// skips, leaving the .map files in the built output. This uploads them for real, once, the
// first time any pod boots off a given image -- GIT_SHA (baked in as a runtime ENV, see
// docker/dockerfile.prod) both identifies that image's build output and doubles as the Redis
// dedup key via claimSourcemapUpload, so every other replica (and any later restart of the
// same image) skips straight past.
export async function uploadSourceMapsOnce(redis: RedisClient): Promise<void> {
  const { SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT } = env;
  const gitSha = process.env.GIT_SHA;

  if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT || !gitSha || gitSha === "unknown") {
    return;
  }

  if (!(await claimSourcemapUpload(redis, "web", gitSha))) {
    return;
  }

  const cli = new SentryCli(null, {
    authToken: SENTRY_AUTH_TOKEN,
    org: SENTRY_ORG,
    project: SENTRY_PROJECT,
  });

  try {
    await cli.execute(
      [
        "sourcemaps",
        "upload",
        path.join(process.cwd(), "src/presentation/web/build/client"),
        path.join(process.cwd(), "src/presentation/web/build/server"),
      ],
      "rejectOnError",
    );
    console.log(`Uploaded source maps to Sentry for ${gitSha}.`);
  } catch (error) {
    // Let a later pod (or this one, on its next restart) retry.
    await releaseSourcemapUploadClaim(redis, "web", gitSha);
    console.error("Failed to upload source maps to Sentry.", error);
  }
}

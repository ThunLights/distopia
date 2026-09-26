import { env } from "$env/dynamic/private";
import SentryCli from "@sentry/cli";
import type { RedisClient } from "infra-redis";
import path from "node:path";
import {
  claimSourcemapUpload,
  markSourcemapUploadDone,
  releaseSourcemapUploadClaim,
} from "repo-redis";

// Source maps are generated at build time (vite.config.ts's sentrySvelteKit plugin still sets
// `build.sourcemap: "hidden"` and injects debug IDs), but SENTRY_AUTH_TOKEN is deliberately
// absent from the build -- see docker/dockerfile.prod and k8s/ci/workflowtemplate.yaml's
// prepare-env step. Without it, the plugin's own build-time upload attempt just warns and
// skips, leaving the .map files in the built output. This uploads them for real, once, the
// first time any pod boots off a given image -- GIT_SHA (baked in as a runtime ENV, see
// docker/dockerfile.prod) both identifies that image's build output and doubles as the Redis
// dedup key via claimSourcemapUpload, so every other replica (and any later restart of the
// same image) skips straight past.
//
// Reads from `.sourcemaps/`, a private copy docker/dockerfile.prod makes of the build output
// before stripping the real .map files out of `build/client` -- adapter-node serves that
// directory as public static files, so anything left there is fetchable by anyone (full
// unminified source, not just a stack-trace-symbolication concern).
//
// Every error this function can hit (Redis unreachable, the upload itself failing, even
// releaseSourcemapUploadClaim failing) is caught here -- callers fire this without awaiting it
// (see hooks.server.ts), so an uncaught rejection here would otherwise surface as an unhandled
// promise rejection.
export async function uploadSourceMapsOnce(redis: RedisClient): Promise<void> {
  const { SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT } = env;
  const gitSha = process.env.GIT_SHA;

  if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT || !gitSha || gitSha === "unknown") {
    return;
  }

  let claimed = false;
  try {
    claimed = await claimSourcemapUpload(redis, "web", gitSha);
    if (!claimed) {
      return;
    }

    const cli = new SentryCli(null, {
      authToken: SENTRY_AUTH_TOKEN,
      org: SENTRY_ORG,
      project: SENTRY_PROJECT,
    });

    await cli.execute(
      [
        "sourcemaps",
        "upload",
        path.join(process.cwd(), ".sourcemaps/client"),
        path.join(process.cwd(), ".sourcemaps/server"),
      ],
      "rejectOnError",
    );
    await markSourcemapUploadDone(redis, "web", gitSha);
    console.log(`Uploaded source maps to Sentry for ${gitSha}.`);
  } catch (error) {
    // Let a later pod (or this one, on its next restart) retry -- swallow a failure here too,
    // rather than letting it replace the more useful error logged below.
    if (claimed) {
      await releaseSourcemapUploadClaim(redis, "web", gitSha).catch(() => {});
    }
    console.error("Failed to upload source maps to Sentry.", error);
  }
}

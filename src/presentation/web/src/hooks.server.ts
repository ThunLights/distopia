import { dev } from "$app/environment";
import { deleteToken, setToken, verifyToken } from "$lib/server/auth";
import { core } from "$lib/server/core";
import { redis } from "$lib/server/redis";
import { startSchedulerRpcServer } from "$lib/server/schedulerRpcListener";
import { uploadSourceMapsOnce } from "$lib/server/sourcemaps";
import { dependencies } from "../package.json";
import * as Sentry from "@sentry/sveltekit";
import { type Handle, type HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { resetEphemeralMemory } from "repo-redis";

// +layout.svelte embeds these literal tokens in its partytown <script> tags; substituted below
// so they never become part of PageData -- that would make them required fields on every route's
// mock `data` in Storybook (see +layout.server.ts, which stays free of this on purpose).
//
// - PARTYTOWN_VERSION_PLACEHOLDER: the installed package version, appended as a `?v=` query
//   param so the URL changes (safely busting the long-lived cache set by its +server.ts)
//   whenever @qwik.dev/partytown is upgraded.
// - PARTYTOWN_DEBUG_PLACEHOLDER: partytown.js defaults to its debug (unminified) build unless
//   `debug` is explicitly `false` -- this keeps it in sync with the +server.ts route, which
//   serves the debug build only when running the dev server.
const PARTYTOWN_VERSION_PLACEHOLDER = "%partytown.version%";
// Quoted (`"..."`) in +layout.svelte so the inline <script> stays valid, parseable JS; the quotes
// are stripped here too so the substituted value lands as a real boolean literal, not a string.
const PARTYTOWN_DEBUG_PLACEHOLDER = '"%partytown.debug%"';
const partytownVersion = dependencies["@qwik.dev/partytown"];

process.on("uncaughtException", async (error) => {
  console.error(error);
});

process.on("unhandledRejection", async (reason) => {
  console.error(reason);
});

async function start() {
  // Wipes this process's `web:ephemeral:*` namespace (see repo-redis's
  // resetEphemeralMemory) -- must run before anything below reads/writes affected stores.
  // presentation-bot resets its own "bot:*" namespace in its own entrypoint now (see its
  // src/index.ts) -- this process only ever owned "web:*".
  //
  // Only OAuth2PKCE currently opts into that namespace (a stray PKCE session id from before
  // a deploy should never authenticate a later /auth callback -- an in-flight login is
  // treated as invalidated by a redeploy, not silently carried across it). Every other
  // repo-redis store (rate limits, the message/member/voice-channel buffers, the URL safety
  // cache, ...) deliberately persists across a redeploy rather than resetting: unlike the
  // in-process `Map`s these replaced, they now live in shared Redis and survive a pod
  // restart on their own, so there's no "fresh Map" to reproduce, and wiping them here would
  // only race against a still-serving old pod during k8s/app/deployment.yaml's RollingUpdate
  // overlap (maxSurge: 1, maxUnavailable: 0) for no benefit.
  //
  // Known gap: that overlap still applies to OAuth2PKCE itself -- if a new pod's boot lands
  // mid-flow, it wipes a PKCE session the still-serving old pod just wrote (or a second
  // replica starting later wipes one the first replica just wrote), even though that pod
  // could still receive the /auth callback for it. Accepted: bounded to a login that happens
  // to straddle a deploy, in which case the user just retries -- never a security issue
  // (worst case is rejecting a still-valid attempt, not accepting a stale one), and the
  // 20-minute TTL already bounds it further. A versioned/deployment-scoped namespace would
  // close this but is real added complexity for a rare, low-cost case.
  await resetEphemeralMemory(redis, "web");
  console.log("Reset ephemeral web memory.");

  // Fire-and-forget: unlike everything else in start(), this never gates the server accepting
  // traffic -- symbolicating a future error report isn't worth delaying every pod's readiness
  // for. uploadSourceMapsOnce handles its own errors internally (see its comment).
  void uploadSourceMapsOnce(redis);

  await core.jwt.importDB();
  console.log("JWT keys is imported.");

  // Best-effort: friend.updateCache() and guild.updateRootPage() both now call out to
  // presentation-bot over RPC (see lib/server/discord.ts) instead of a local discord.js
  // cache, so a bot pod that isn't reachable yet (mid-rollout, mid-Discord-login) must not
  // crash this process's own startup -- that would turn one slow dependency into a
  // crash-looping web pod too.
  //
  // friend.updateCache() fully self-heals: it's retried every 20 minutes by
  // runTwentyMinuteTasks (schedulerRpcServer.ts), so a boot-time failure here just leaves
  // the Friend page on its last-cached data until that next tick.
  //
  // guild.updateRootPage() only partially self-heals: its `activeGuilds` half gets
  // refreshed as a side effect of activeRate.update() on that same 20-minute tick, but its
  // `latestGuilds` half (the root page's "newest bumped guilds" list) isn't re-run by
  // anything else -- a boot-time failure leaves it at its empty initial value until the
  // next actual bump() call updates it incrementally. Acceptable: a stale/empty display
  // list, not a correctness or data-loss issue, same severity class as the search index gap
  // below.
  try {
    await core.friend.updateCache();
    console.log("Updated friend cache.");
  } catch (error) {
    console.error("Failed to update friend cache:", error);
  }

  await core.record.update();
  console.log("Updated guild records.");

  try {
    await core.guild.updateRootPage();
    console.log("Updated root page guilds.");
  } catch (error) {
    console.error("Failed to update root page guilds:", error);
  }

  // Best-effort: the index now lives in presentation-searchengine (see lib/server/search.ts),
  // so a search outage must not take the whole site down with it -- an empty index just
  // returns 0 hits (repo-search's SearchEngine short-circuits on an empty index).
  // schedulerRpcServer.ts's runTwentyMinuteTasks re-indexes, so a failure here recovers on
  // its own rather than lasting until the next restart.
  try {
    await core.guild.loadSearchEngine();
    console.log("Loaded SearchEngine.");
  } catch (error) {
    console.error("Failed to load SearchEngine:", error);
  }

  startSchedulerRpcServer();
  console.log("Scheduler RPC server started.");
}

export const handle = sequence(Sentry.sentryHandle(), (async ({ event, resolve }) => {
  const oldToken = event.cookies.get("authorization");
  const user = await verifyToken(event.cookies);

  event.locals = { user: user?.public ?? null };

  if (user?.private.token) {
    const newToken = user.private.token;
    if (newToken !== oldToken) {
      await setToken(event.cookies, newToken);
    }
  } else {
    if (oldToken !== undefined) {
      await deleteToken(event.cookies);
    }
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html
        .replaceAll(PARTYTOWN_VERSION_PLACEHOLDER, partytownVersion)
        .replaceAll(PARTYTOWN_DEBUG_PLACEHOLDER, String(dev)),
  });

  // /~partytown/* sets its own long-lived, version-busted Cache-Control (see its +server.ts) --
  // forcing no-store here would defeat that caching entirely.
  if (!event.url.pathname.startsWith("/~partytown/")) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}) satisfies Handle);

export const handleError = Sentry.handleErrorWithSentry((async (input) => {
  if (input.status === 404) {
    return { message: "Page Not found" };
  }
  if (input.status === 405) {
    return { message: "Method Not Allowed" };
  }
}) satisfies HandleServerError);

await start();

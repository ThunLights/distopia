import { dev } from "$app/environment";
import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { deleteToken, setToken, verifyToken } from "$lib/server/auth";
import { client } from "$lib/server/bot";
import { core, updatePanels } from "$lib/server/core";
import { redis } from "$lib/server/redis";
import { uploadSourceMapsOnce } from "$lib/server/sourcemaps";
import { dependencies } from "../package.json";
import * as Sentry from "@sentry/sveltekit";
import { type Handle, type HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { setScheduleTask } from "app-schedule";
import { handleClient } from "presentation-bot";
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
  const { BOT_TOKEN } = privateEnv;
  const {
    PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID,
    PUBLIC_HOME_SERVER_ID,
    PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID,
    PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID,
  } = publicEnv;

  // Wipes each owner's `<owner>:ephemeral:*` namespace (see repo-redis's
  // resetEphemeralMemory) -- must run before anything below reads/writes affected stores.
  // Resets both "web:*" and "bot:*" here because this one process still plays both roles
  // (see lib/server/memory.ts's ratelimit comment) -- once presentation-bot gets its own
  // entrypoint, move the "bot" call there and drop it from here.
  //
  // Only OAuth2PKCE currently opts into that namespace (a stray PKCE session id from before
  // a deploy should never authenticate a later /auth callback -- an in-flight login is
  // treated as invalidated by a redeploy, not silently carried across it), and it's
  // web-owned -- so the "bot" call below currently has nothing to delete. Every other
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
  await resetEphemeralMemory(redis, "bot");
  console.log("Reset ephemeral web/bot memory.");

  // Fire-and-forget: unlike everything else in start(), this never gates the server accepting
  // traffic -- symbolicating a future error report isn't worth delaying every pod's readiness
  // for. uploadSourceMapsOnce handles its own errors internally (see its comment).
  void uploadSourceMapsOnce(redis);

  await core.jwt.importDB();
  console.log("JWT keys is imported.");

  await handleClient(client, core).login(BOT_TOKEN);
  console.log("BOT logged in.");

  await core.friend.updateCache();
  console.log("Updated friend cache.");

  await core.record.update();
  console.log("Updated guild records.");

  await core.guild.updateRootPage();
  console.log("Updated root page guilds.");

  await core.guild.loadSearchEngine();
  console.log("Loaded SearchEngine.");

  setScheduleTask({
    core,
    updatePanels,
    homeServerId: PUBLIC_HOME_SERVER_ID!,
    specialDirectorsRoleId: PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID!,
    directorsRoleId: PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID!,
    subDirectorsRoleId: PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID!,
  });
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

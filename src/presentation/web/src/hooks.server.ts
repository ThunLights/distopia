import { dev } from "$app/environment";
import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { deleteToken, setToken, verifyToken } from "$lib/server/auth";
import { client } from "$lib/server/bot";
import { core, updatePanels } from "$lib/server/core";
import { redis } from "$lib/server/redis";
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

  // Reproduces "fresh Map on every process start" for the repo-memory stores that have
  // moved to Redis (see repo-redis's resetEphemeralMemory) -- must run before anything
  // below reads/writes them. Resets both "web:*" and "bot:*" here because this one process
  // still plays both roles (see lib/server/memory.ts's ratelimit comment) -- once
  // presentation-bot gets its own entrypoint, move the "bot" call there and drop it from here.
  await resetEphemeralMemory(redis, "web");
  await resetEphemeralMemory(redis, "bot");
  console.log("Reset ephemeral web/bot memory.");

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

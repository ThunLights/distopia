import { BOT_TOKEN } from "$env/static/private";
import {
  PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID,
  PUBLIC_HOME_SERVER_ID,
  PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID,
  PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID,
} from "$env/static/public";
import { deleteToken, setToken, verifyToken } from "$lib/server/auth";
import { client } from "$lib/server/bot";
import { core, updatePanels } from "$lib/server/core";
import { schedule } from "$lib/server/schedule";
import { type Handle, type HandleServerError } from "@sveltejs/kit";
import { handleClient } from "presentation-bot";

process.on("uncaughtException", async (error) => {
  console.error(error);
});

process.on("unhandledRejection", async (reason) => {
  console.error(reason);
});

async function start() {
  await core.jwt.importDB();
  console.log("JWT keys is imported.");

  await handleClient(client, core).login(BOT_TOKEN);
  console.log("BOT logined.");

  await core.friend.updateCache();
  console.log("Updated friend cache.");

  await core.record.update();
  console.log("Updated guild records.");

  await core.guild.updateRootPage();
  console.log("Updated root page guilds.");

  await core.guild.loadSearchEngine();
  console.log("Loaded SearchEngine.");

  schedule.add(
    "*/30 * * * * *",
    async () => {
      await core.guild.updateRootPage();
    },
    { noOverlap: true },
  );

  schedule.add(
    "*/5 * * * *",
    async () => {
      await core.jwt.update();
      await core.message.syncDB();
      await core.member.syncDB();
      await core.memory.gcForShortInterval();
    },
    // Prevent a slow run from overlapping the next tick, which caused
    // concurrent guildRecordOneDay upserts to deadlock (Postgres 40P01)
    // with the */20 job below.
    { noOverlap: true },
  );

  schedule.add(
    "*/20 * * * *",
    async () => {
      await core.oauth2.updateTokens();
      await core.friend.updateCache();

      await core.memory.gc();
      await core.guild.removeUnJoinedGuildData();
      await core.voice.update();
      await core.activeRate.update();
      await core.ranking.cleanCache();
      await core.updateHomeGuildRoles(
        PUBLIC_HOME_SERVER_ID,
        PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID,
        PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID,
        PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID,
      );
      await core.record.update();
      await updatePanels();
    },
    // This job's runtime scales with guild count (sequential Discord API
    // calls); without noOverlap a slow run can still be executing when the
    // next tick fires, causing concurrent guildRecord upserts to deadlock.
    { noOverlap: true },
  );
}

export const handle = (async ({ event, resolve }) => {
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

  const response = await resolve(event);

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");

  return response;
}) satisfies Handle;

export const handleError = (async (input) => {
  if (input.status === 404) {
    return { message: "Page Not found" };
  }
  if (input.status === 405) {
    return { message: "Method Not Allowed" };
  }
}) satisfies HandleServerError;

await start();

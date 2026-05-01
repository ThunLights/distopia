import { BOT_TOKEN } from "$env/static/private";
import {
  PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID,
  PUBLIC_HOME_SERVER_ID,
  PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID,
  PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID,
} from "$env/static/public";
import { core } from "$lib/server/core";
import { client } from "$lib/server/discord";
import { schedule } from "$lib/server/schedule";
import { type Handle, type HandleServerError } from "@sveltejs/kit";

process.on("uncaughtException", async (error) => {
  console.error(error);
});

process.on("unhandledRejection", async (reason) => {
  console.error(reason);
});

async function start() {
  await client.login(BOT_TOKEN);
  console.log("BOT logined.");

  schedule.add("*/20 * * * *", async () => {
    await core.memory.gc();
    await core.activeRate.update();
    await core.ranking.cleanCache();
    await core.updateHomeGuildRoles(
      PUBLIC_HOME_SERVER_ID,
      PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID,
      PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID,
      PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID,
    );
  });
}

export const handle = (async ({ event, resolve }) => {
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

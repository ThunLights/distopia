import { BOT_TOKEN } from "$env/static/private";
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
    await core.ranking.updateCache();
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

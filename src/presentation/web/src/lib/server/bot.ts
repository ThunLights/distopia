import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { Controller, genClient } from "infra-discord";

export const client = genClient();

export const djsController = new Controller(client, {
  id: publicEnv.PUBLIC_BOT_ID,
  secret: privateEnv.BOT_SECRET,
  url: `${publicEnv.PUBLIC_URL}/auth`,
  token: privateEnv.BOT_TOKEN,
});

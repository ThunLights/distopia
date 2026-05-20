import { BOT_REDIRECT_URL, BOT_SECRET, BOT_TOKEN } from "$env/static/private";
import { PUBLIC_BOT_ID } from "$env/static/public";
import { Controller, genClient } from "infra-discord";

export const client = genClient();

export const djsController = new Controller(client, {
  id: PUBLIC_BOT_ID,
  secret: BOT_SECRET,
  url: BOT_REDIRECT_URL,
  token: BOT_TOKEN,
});

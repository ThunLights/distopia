import { env } from "$env/dynamic/private";
import { PUBLIC_BOT_ID, PUBLIC_URL } from "$env/static/public";
import { requireEnv } from "./env";
import { Controller, genClient } from "infra-discord";

export const client = genClient();

export const djsController = new Controller(client, {
  id: PUBLIC_BOT_ID,
  secret: requireEnv("BOT_SECRET", env.BOT_SECRET),
  url: `${PUBLIC_URL}/auth`,
  token: requireEnv("BOT_TOKEN", env.BOT_TOKEN),
});

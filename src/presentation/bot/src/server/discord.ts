import { Controller, genClient } from "infra-discord";

const { PUBLIC_BOT_ID, BOT_SECRET, PUBLIC_URL, BOT_TOKEN } = process.env;
if (!PUBLIC_BOT_ID || !BOT_SECRET || !PUBLIC_URL || !BOT_TOKEN) {
  throw new Error("PUBLIC_BOT_ID, BOT_SECRET, PUBLIC_URL and BOT_TOKEN are required");
}

export const client = genClient();

// The one real, logged-in Client in the whole system (see index.ts's .login() call) --
// everything in AppState.discord that needs the live gateway cache is served to
// presentation-web from here (see ../rpc.ts and infra-rpc's BotService).
export const djsController = new Controller(client, {
  id: PUBLIC_BOT_ID,
  secret: BOT_SECRET,
  url: `${PUBLIC_URL}/auth`,
  token: BOT_TOKEN,
});

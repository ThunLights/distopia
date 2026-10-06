import { AppCore } from "app-core";

import { database } from "./database";
import { djsController } from "./discord";
import { memory } from "./memory";
import { redis } from "./redis";
import { searchEngine } from "./search";

const {
  PUBLIC_OWNER_ID,
  PUBLIC_HOME_SERVER_ID,
  PUBLIC_URL,
  VOICEVOX_API_KEY,
  SAKURA_AI_ENGINE_API_KEY,
} = process.env;
if (!PUBLIC_OWNER_ID || !PUBLIC_HOME_SERVER_ID || !PUBLIC_URL) {
  throw new Error("PUBLIC_OWNER_ID, PUBLIC_HOME_SERVER_ID and PUBLIC_URL are required");
}

export const core = new AppCore({
  owner: { id: PUBLIC_OWNER_ID },
  homeServerId: PUBLIC_HOME_SERVER_ID,
  url: PUBLIC_URL,
  voicevoxApiKey: VOICEVOX_API_KEY ?? null,
  sakuraApiKey: SAKURA_AI_ENGINE_API_KEY ?? null,
  memory,
  searchEngine,
  discord: djsController,
  database,
  redis,
});

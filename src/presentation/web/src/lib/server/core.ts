import {
  BOT_RPC_TOKEN,
  BOT_RPC_URL,
  BOT_SECRET,
  BOT_TOKEN,
  SAKURA_AI_ENGINE_API_KEY,
  SEARCHENGINE_RPC_TOKEN,
  SEARCHENGINE_RPC_URL,
  VOICEVOX_API_KEY,
} from "$app/env/private";
import { PUBLIC_BOT_ID, PUBLIC_HOME_SERVER_ID, PUBLIC_OWNER_ID, PUBLIC_URL } from "$app/env/public";
import { database } from "./database";
import { redis } from "./redis";
import { AppCore } from "app-core";
import { createMemory, createRemoteDiscordClient, createRemoteSearchEngine } from "app-core/remote";
import { Controller, genClient } from "infra-discord";

export const core = new AppCore({
  owner: { id: PUBLIC_OWNER_ID! },
  homeServerId: PUBLIC_HOME_SERVER_ID!,
  url: PUBLIC_URL!,
  voicevoxApiKey: VOICEVOX_API_KEY ?? null,
  sakuraApiKey: SAKURA_AI_ENGINE_API_KEY ?? null,
  rankCardRenderer: null,
  memory: createMemory(redis),
  searchEngine: createRemoteSearchEngine({
    url: SEARCHENGINE_RPC_URL,
    token: SEARCHENGINE_RPC_TOKEN,
  }),
  discord: createRemoteDiscordClient(
    new Controller(genClient(), {
      id: PUBLIC_BOT_ID!,
      secret: BOT_SECRET!,
      url: `${PUBLIC_URL!}/auth`,
      token: BOT_TOKEN!,
    }),
    { url: BOT_RPC_URL, token: BOT_RPC_TOKEN },
  ),
  database,
  redis,
});

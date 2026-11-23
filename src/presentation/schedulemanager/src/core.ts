import { AppCore } from "app-core";
import { createMemory, createRemoteDiscordClient, createRemoteSearchEngine } from "app-core/remote";
import { genDatabaseClient } from "infra-database";
import { Controller, genClient } from "infra-discord";
import { createRedisClient } from "infra-redis";

const env = process.env;
// Only what's needed to start; the Discord/RPC values fail the job that uses them, not boot
// (CI on a fork runs without BOT_TOKEN/BOT_SECRET).
if (!env.DATABASE_URL || !env.REDIS_URL) {
  throw new Error("DATABASE_URL and REDIS_URL are required");
}

export const redis = createRedisClient(env.REDIS_URL);

export const discord = createRemoteDiscordClient(
  new Controller(genClient(), {
    id: env.PUBLIC_BOT_ID!,
    secret: env.BOT_SECRET!,
    url: `${env.PUBLIC_URL!}/auth`,
    token: env.BOT_TOKEN!,
  }),
  { url: env.BOT_RPC_URL, token: env.BOT_RPC_TOKEN },
);

export const core = new AppCore({
  owner: { id: env.PUBLIC_OWNER_ID! },
  homeServerId: env.PUBLIC_HOME_SERVER_ID!,
  url: env.PUBLIC_URL!,
  voicevoxApiKey: env.VOICEVOX_API_KEY ?? null,
  sakuraApiKey: env.SAKURA_AI_ENGINE_API_KEY ?? null,
  rankCardRenderer: null,
  memory: createMemory(redis),
  searchEngine: createRemoteSearchEngine({
    url: env.SEARCHENGINE_RPC_URL,
    token: env.SEARCHENGINE_RPC_TOKEN,
  }),
  discord,
  database: genDatabaseClient(env.DATABASE_URL),
  redis,
});

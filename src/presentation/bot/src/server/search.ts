import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { createBearerAuthInterceptor, SearchEngineService } from "infra-rpc";
import type { SearchEngineClient } from "repo-search";

const SEARCH_TIMEOUT_MS = 10_000;
const LOAD_TIMEOUT_MS = 60_000;

const { SEARCHENGINE_RPC_URL, SEARCHENGINE_RPC_TOKEN } = process.env;
if (!SEARCHENGINE_RPC_URL || !SEARCHENGINE_RPC_TOKEN) {
  throw new Error("SEARCHENGINE_RPC_URL and SEARCHENGINE_RPC_TOKEN are required");
}

const client: Client<typeof SearchEngineService> = createClient(
  SearchEngineService,
  createConnectTransport({
    baseUrl: SEARCHENGINE_RPC_URL,
    httpVersion: "1.1",
    defaultTimeoutMs: SEARCH_TIMEOUT_MS,
    interceptors: [createBearerAuthInterceptor(SEARCHENGINE_RPC_TOKEN)],
  }),
);

// Mirrors presentation-web's lib/server/search.ts -- see its comment. presentation-bot needs
// this too for its own guild-profile-editing commands (AppCore's Guild.save/loadSearchEngine).
export const searchEngine: SearchEngineClient = {
  async upsert(value) {
    await client.upsert({ value });
  },

  async upsertAll(values) {
    await client.upsertAll({ values }, { timeoutMs: LOAD_TIMEOUT_MS });
  },

  async delete(guildId) {
    await client.delete({ guildId });
  },

  async search(term, options) {
    const { hits, count, time } = await client.search({
      term,
      nsfw: options?.filter.nsfw,
      alg: options?.alg,
    });
    return { hits, count, time };
  },
};

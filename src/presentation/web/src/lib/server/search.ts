import { env as privateEnv } from "$env/dynamic/private";
import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { createBearerAuthInterceptor, SearchEngineService } from "infra-rpc";
import type { SearchEngineClient } from "repo-search";

// Built on first call, not at module load: `vite build`'s prerender analysis imports this
// module with an empty $env/dynamic/private, so an eager env check fails the build.
let client: Client<typeof SearchEngineService> | undefined;

function rpc() {
  if (!client) {
    const { SEARCHENGINE_RPC_URL, SEARCHENGINE_RPC_TOKEN } = privateEnv;
    if (!SEARCHENGINE_RPC_URL || !SEARCHENGINE_RPC_TOKEN) {
      throw new Error("SEARCHENGINE_RPC_URL and SEARCHENGINE_RPC_TOKEN are required");
    }

    client = createClient(
      SearchEngineService,
      createConnectTransport({
        baseUrl: SEARCHENGINE_RPC_URL,
        httpVersion: "1.1",
        interceptors: [createBearerAuthInterceptor(SEARCHENGINE_RPC_TOKEN)],
      }),
    );
  }

  return client;
}

// The Orama index itself lives in presentation-searchengine now; this only forwards the
// SearchEngine surface AppCore calls (see AppState.searchEngine) over Connect RPC.
export const searchEngine: SearchEngineClient = {
  async upsert(value) {
    await rpc().upsert({ value });
  },

  async upsertAll(values) {
    await rpc().upsertAll({ values });
  },

  async delete(guildId) {
    await rpc().delete({ guildId });
  },

  async search(term, options) {
    const { hits, count, time } = await rpc().search({
      term,
      nsfw: options?.filter.nsfw,
      alg: options?.alg,
    });
    return { hits, count, time };
  },
};

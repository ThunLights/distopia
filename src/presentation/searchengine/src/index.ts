import { createServer } from "node:http";

import { connectNodeAdapter } from "@connectrpc/connect-node";
import { requireBearerAuth, SearchEngineService } from "infra-rpc";
import { SearchEngine, type SearchOptions } from "repo-search";

const { SEARCHENGINE_RPC_PORT, SEARCHENGINE_RPC_TOKEN } = process.env;
if (!SEARCHENGINE_RPC_PORT || !SEARCHENGINE_RPC_TOKEN) {
  throw new Error("SEARCHENGINE_RPC_PORT and SEARCHENGINE_RPC_TOKEN are required");
}

const engine = new SearchEngine();

// ClusterIP-only (see k8s/app/searchengine-networkpolicy.yaml) -- only distopia-app is
// allowed to reach this port. The bearer token is defense in depth on top of that
// NetworkPolicy, not a substitute for it.
const handler = connectNodeAdapter({
  routes: (router) =>
    router.service(SearchEngineService, {
      async upsert({ value }) {
        if (value) {
          await engine.upsert(value);
        }
        return {};
      },

      async upsertAll({ values }) {
        await engine.upsertAll(values);
        return {};
      },

      async delete({ guildId }) {
        await engine.delete(guildId);
        return {};
      },

      async search({ term, nsfw, alg }) {
        return await engine.search(term, {
          filter: { nsfw },
          alg: alg.length > 0 ? (alg as SearchOptions["alg"]) : undefined,
        });
      },
    }),
  interceptors: [requireBearerAuth(SEARCHENGINE_RPC_TOKEN)],
});

createServer(handler).listen(Number(SEARCHENGINE_RPC_PORT));

console.log("searchengine RPC server listening on", SEARCHENGINE_RPC_PORT);

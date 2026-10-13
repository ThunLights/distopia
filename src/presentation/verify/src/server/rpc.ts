import { createServer } from "node:http";

import { connectNodeAdapter } from "@connectrpc/connect-node";
import { requireBearerAuth, VerifyService } from "infra-rpc";

import * as plugin from "../plugin";

const { VERIFY_RPC_PORT, VERIFY_RPC_TOKEN } = process.env;
if (!VERIFY_RPC_PORT || !VERIFY_RPC_TOKEN) {
  throw new Error("VERIFY_RPC_PORT and VERIFY_RPC_TOKEN are required");
}

// ClusterIP-only (see k8s/app/verify-networkpolicy.yaml) -- only distopia-app is allowed to
// reach this port. The bearer token is defense in depth on top of that NetworkPolicy, not a
// substitute for it. Every method here just delegates to plugin.ts's loader -- this process
// never implements any anti-bot/fingerprinting logic itself, only the plumbing to an
// optional, privately-mounted plugin file.
const handler = connectNodeAdapter({
  routes: (router) =>
    router.service(VerifyService, {
      async evaluate({ guildId, userId, extraJson, headers }) {
        // extraJson is attacker-reachable (relayed from the browser's POST body via
        // presentation-web) and empty is the proto3 default -- fail closed on malformed JSON
        // rather than letting it throw into an RPC Internal error.
        let extra: unknown;
        try {
          extra = extraJson ? JSON.parse(extraJson) : null;
        } catch {
          return { allowed: false };
        }
        const allowed = await plugin.evaluate({ guildId, userId, extra, headers });
        return { allowed };
      },

      async getClientScript() {
        return { code: await plugin.getClientScript() };
      },

      async decryptBody({ encrypted }) {
        const json = await plugin.decryptBody(encrypted);
        return { json: json ?? undefined };
      },
    }),
  interceptors: [requireBearerAuth(VERIFY_RPC_TOKEN)],
});

export function startVerifyRpcServer() {
  createServer(handler).listen(Number(VERIFY_RPC_PORT));
  console.log("verify RPC server listening on", VERIFY_RPC_PORT);
}

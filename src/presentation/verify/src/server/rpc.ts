import { createServer } from "node:http";

import { connectNodeAdapter } from "@connectrpc/connect-node";
import { requireBearerAuth, VerifyService } from "infra-rpc";

import { evaluate } from "../checks";
import * as plugin from "../plugin";

const { VERIFY_RPC_PORT, VERIFY_RPC_TOKEN, TURNSTILE_SECRET_KEY } = process.env;
if (!VERIFY_RPC_PORT || !VERIFY_RPC_TOKEN || !TURNSTILE_SECRET_KEY) {
  throw new Error("VERIFY_RPC_PORT, VERIFY_RPC_TOKEN and TURNSTILE_SECRET_KEY are required");
}

// ClusterIP-only (see k8s/app/verify-networkpolicy.yaml) -- only distopia-app is allowed to
// reach this port. The bearer token is defense in depth on top of that NetworkPolicy, not a
// substitute for it. Every method here just delegates to plugin.ts's loader -- the VPN and
// Turnstile checks live in ../checks.ts; anti-bot/fingerprinting logic is never implemented
// here, only the plumbing to an optional, privately-mounted plugin file.
const handler = connectNodeAdapter({
  routes: (router) =>
    router.service(VerifyService, {
      async evaluate({ guildId, userId, extraJson, request, turnstileToken, blockVpn }) {
        // extraJson is attacker-reachable (relayed from the browser's POST body via
        // presentation-web) and empty is the proto3 default -- fail closed on malformed JSON
        // rather than letting it throw into an RPC Internal error.
        let extra: unknown;
        try {
          extra = extraJson ? JSON.parse(extraJson) : null;
        } catch {
          return { allowed: false, reason: "Invalid extra payload" };
        }
        return await evaluate({
          guildId,
          userId,
          extra,
          turnstileToken,
          blockVpn,
          turnstileSecret: TURNSTILE_SECRET_KEY,
          request: { headers: request?.headers ?? {}, ip: request?.ip ?? null },
        });
      },

      async getClientScript() {
        return { code: await plugin.getClientScript(), wasm: await plugin.getClientWasm() };
      },

      async decrypt({ encrypted, request }) {
        const json = await plugin.decrypt(encrypted, {
          headers: request?.headers ?? {},
          ip: request?.ip ?? null,
        });
        return { json: json ?? undefined };
      },
    }),
  interceptors: [requireBearerAuth(VERIFY_RPC_TOKEN)],
});

export function startVerifyRpcServer() {
  createServer(handler).listen(Number(VERIFY_RPC_PORT));
  console.log("verify RPC server listening on", VERIFY_RPC_PORT);
}

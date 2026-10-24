import { createServer } from "node:http";

import { connectNodeAdapter } from "@connectrpc/connect-node";
import { genDatabaseClient } from "infra-database";
import { fetchOAuth2Guilds } from "infra-discord";
import { requireBearerAuth, VerifyService } from "infra-rpc";

import { createBotClient } from "../bot";
import * as plugin from "../plugin";
import { submit, type SubmitDeps } from "../submit";

const { VERIFY_RPC_PORT, VERIFY_RPC_TOKEN, TURNSTILE_SECRET_KEY, DATABASE_URL } = process.env;
const { BOT_RPC_URL, BOT_RPC_TOKEN } = process.env;
if (
  !VERIFY_RPC_PORT ||
  !VERIFY_RPC_TOKEN ||
  !TURNSTILE_SECRET_KEY ||
  !DATABASE_URL ||
  !BOT_RPC_URL ||
  !BOT_RPC_TOKEN
) {
  throw new Error(
    "VERIFY_RPC_PORT, VERIFY_RPC_TOKEN, TURNSTILE_SECRET_KEY, DATABASE_URL, BOT_RPC_URL and BOT_RPC_TOKEN are required",
  );
}

const deps: SubmitDeps = {
  database: genDatabaseClient(DATABASE_URL),
  fetchGuilds: fetchOAuth2Guilds,
  bot: createBotClient(BOT_RPC_URL, BOT_RPC_TOKEN),
  turnstileSecret: TURNSTILE_SECRET_KEY,
};

// ClusterIP-only (see k8s/app/verify-networkpolicy.yaml) -- only distopia-app is allowed to
// reach this port. The bearer token is defense in depth on top of that NetworkPolicy, not a
// substitute for it. The whole verification flow lives in ../submit.ts (the VPN and
// Turnstile checks in ../checks.ts); anti-bot/fingerprinting logic is never implemented
// here, only the plumbing to an optional, privately-mounted plugin file via plugin.ts.
const handler = connectNodeAdapter({
  routes: (router) =>
    router.service(VerifyService, {
      async submit({ userId, body, encrypted, request }) {
        const result = await submit(deps, {
          userId,
          body,
          encrypted,
          request: { headers: request?.headers ?? {}, ip: request?.ip ?? null },
        });
        return result.ok ? { ok: true } : { ok: false, error: result.error };
      },

      async getClientScript() {
        return { code: await plugin.getClientScript(), wasm: await plugin.getClientWasm() };
      },
    }),
  interceptors: [requireBearerAuth(VERIFY_RPC_TOKEN)],
});

export function startVerifyRpcServer() {
  createServer(handler).listen(Number(VERIFY_RPC_PORT));
  console.log("verify RPC server listening on", VERIFY_RPC_PORT);
}

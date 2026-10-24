import { VERIFY_RPC_TOKEN, VERIFY_RPC_URL } from "$app/env/private";
import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { createBearerAuthInterceptor, VerifyService } from "infra-rpc";

// Longer than discord.ts's BOT_RPC_TIMEOUT_MS: a Submit runs the Turnstile and VPN lookups,
// the DB writes and two bot RPCs back to back inside presentation-verify.
const VERIFY_RPC_TIMEOUT_MS = 30_000;

// Local-dev default (matches .env.example's VERIFY_RPC_PORT); k8s sets VERIFY_RPC_URL itself via
// the distopia-config ConfigMap.
const DEFAULT_VERIFY_RPC_URL = "http://localhost:8084";

let rpcClient: Client<typeof VerifyService> | undefined | null;

// Same shape as discord.ts's rpc(), except null (not configured) is a normal state here, which
// submitVerify turns into a refusal instead of throwing at startup.
function rpc(): Client<typeof VerifyService> | null {
  if (rpcClient === undefined) {
    rpcClient = VERIFY_RPC_TOKEN
      ? createClient(
          VerifyService,
          createConnectTransport({
            baseUrl: VERIFY_RPC_URL ?? DEFAULT_VERIFY_RPC_URL,
            httpVersion: "1.1",
            defaultTimeoutMs: VERIFY_RPC_TIMEOUT_MS,
            interceptors: [createBearerAuthInterceptor(VERIFY_RPC_TOKEN)],
          }),
        )
      : null;
  }

  return rpcClient;
}

// Headers a private VerifyService implementation has no legitimate reason to see -- this
// request's own session credentials, not anti-bot signal.
const STRIPPED_HEADERS = new Set(["cookie", "authorization"]);

// Extensibility point: forwards the raw incoming request headers through to the (optional)
// private VerifyService unchanged, so a plugin implementation can use whatever it wants
// (User-Agent, Accept-Language, sec-ch-*, ...) for its own heuristics without this repo
// needing to know about or react to any of them.
export function pluginHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [name, value] of headers) {
    if (!STRIPPED_HEADERS.has(name.toLowerCase())) {
      result[name] = value;
    }
  }
  return result;
}

export type SubmitVerifyResult = { ok: true } | { ok: false; error: string };

// The whole verification attempt runs inside presentation-verify; an unconfigured or
// unreachable service refuses the attempt (with a reason) instead of silently skipping it.
export async function submitVerify(input: {
  userId: string;
  body: string;
  encrypted: boolean;
  headers: Record<string, string>;
  ip: string | null;
}): Promise<SubmitVerifyResult> {
  const client = rpc();
  if (!client) {
    return { ok: false, error: "Verification service is not configured" };
  }

  try {
    const { ok, error } = await client.submit({
      userId: input.userId,
      body: input.body,
      encrypted: input.encrypted,
      request: { headers: input.headers, ip: input.ip ?? undefined },
    });
    return ok ? { ok: true } : { ok: false, error: error ?? "Unknown reason" };
  } catch {
    return { ok: false, error: "Verification service is unavailable" };
  }
}

export async function fetchVerifyClientScript(): Promise<{
  code: string;
  wasm: string | null;
} | null> {
  const client = rpc();
  if (!client) {
    return null;
  }

  try {
    const { code, wasm } = await client.getClientScript({});
    return code
      ? { code, wasm: wasm.length > 0 ? Buffer.from(wasm).toString("base64") : null }
      : null;
  } catch {
    return null;
  }
}

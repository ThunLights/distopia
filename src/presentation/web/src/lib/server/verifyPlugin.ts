import { env as privateEnv } from "$env/dynamic/private";
import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { createBearerAuthInterceptor, VerifyService } from "infra-rpc";

// Same reasoning as lib/server/discord.ts's own BOT_RPC_TIMEOUT_MS.
const VERIFY_RPC_TIMEOUT_MS = 10_000;

// Local-dev default (matches .env.example's VERIFY_RPC_PORT); k8s sets VERIFY_RPC_URL itself via
// the distopia-config ConfigMap.
const DEFAULT_VERIFY_RPC_URL = "http://localhost:8084";

let rpcClient: Client<typeof VerifyService> | undefined | null;

// Same shape as discord.ts's rpc(), except null (not configured) is a normal state here, which
// evaluateVerify turns into a refusal instead of throwing at startup.
function rpc(): Client<typeof VerifyService> | null {
  if (rpcClient === undefined) {
    const { VERIFY_RPC_URL, VERIFY_RPC_TOKEN } = privateEnv;
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

export type VerifyOutcome = {
  allowed: boolean;
  reason: string | null;
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  vpnProvider: string | null;
};

const REFUSED: VerifyOutcome = {
  allowed: false,
  reason: null,
  isVpn: false,
  isProxy: false,
  isTor: false,
  vpnProvider: null,
};

// Turnstile, the VPN check and the plugin all run inside presentation-verify now, so an
// unconfigured or unreachable service refuses the attempt (with a reason) instead of
// silently skipping the checks.
export async function evaluateVerify(input: {
  guildId: string;
  userId: string;
  extra?: unknown;
  turnstileToken: string;
  blockVpn: boolean;
  headers?: Record<string, string>;
  ip?: string | null;
}): Promise<VerifyOutcome> {
  const client = rpc();
  if (!client) {
    return { ...REFUSED, reason: "Verification service is not configured" };
  }

  try {
    const { allowed, reason, vpn } = await client.evaluate({
      guildId: input.guildId,
      userId: input.userId,
      extraJson: JSON.stringify(input.extra ?? null),
      turnstileToken: input.turnstileToken,
      blockVpn: input.blockVpn,
      request: { headers: input.headers ?? {}, ip: input.ip ?? undefined },
    });
    return {
      allowed,
      reason: reason ?? null,
      isVpn: vpn?.isVpn ?? false,
      isProxy: vpn?.isProxy ?? false,
      isTor: vpn?.isTor ?? false,
      vpnProvider: vpn?.provider ?? null,
    };
  } catch {
    return { ...REFUSED, reason: "Verification service is unavailable" };
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

// Reverses whatever the client script's own VerifyClientPlugin.encrypt() produced -- only
// ever called when the client flagged its body as plugin-encrypted in the first place (see
// lib/client/verify.ts), so "not configured"/"unreachable" here is a real error, not the
// normal fallback: the client already committed to an encrypted body that only
// the private service can reverse.
export async function decryptPluginBody(
  encrypted: string,
  context: { headers: Record<string, string>; ip: string | null },
): Promise<string | null> {
  const client = rpc();
  if (!client) {
    return null;
  }

  try {
    const { json } = await client.decrypt({
      encrypted,
      request: { headers: context.headers, ip: context.ip ?? undefined },
    });
    return json ?? null;
  } catch {
    return null;
  }
}

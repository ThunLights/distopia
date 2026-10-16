import { env as privateEnv } from "$env/dynamic/private";
import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { createBearerAuthInterceptor, VerifyService } from "infra-rpc";

// Same reasoning as lib/server/discord.ts's own BOT_RPC_TIMEOUT_MS.
const VERIFY_RPC_TIMEOUT_MS = 10_000;

let rpcClient: Client<typeof VerifyService> | undefined | null;

// Unlike discord.ts's rpc() (BOT_RPC_URL/BOT_RPC_TOKEN are required -- presentation-web can't
// function without the bot), the verify service is an optional, privately-implemented
// add-on that doesn't exist in this public repo at all (see k8s/README.md's "Verify RPC"
// section) -- null here just means "not configured," not an error.
function rpc(): Client<typeof VerifyService> | null {
  if (rpcClient === undefined) {
    const { VERIFY_RPC_URL, VERIFY_RPC_TOKEN } = privateEnv;
    rpcClient =
      VERIFY_RPC_URL && VERIFY_RPC_TOKEN
        ? createClient(
            VerifyService,
            createConnectTransport({
              baseUrl: VERIFY_RPC_URL,
              httpVersion: "1.1",
              defaultTimeoutMs: VERIFY_RPC_TIMEOUT_MS,
              interceptors: [createBearerAuthInterceptor(VERIFY_RPC_TOKEN)],
            }),
          )
        : null;
  }

  return rpcClient;
}

export function isVerifyPluginConfigured(): boolean {
  return rpc() !== null;
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

export async function evaluateVerifyPlugin(input: {
  guildId: string;
  userId: string;
  extra?: unknown;
  headers?: Record<string, string>;
  ip?: string | null;
}): Promise<boolean> {
  const client = rpc();
  if (!client) {
    return true; // no private verify service configured -- nothing extra to check
  }

  try {
    const { allowed } = await client.evaluate({
      guildId: input.guildId,
      userId: input.userId,
      extraJson: JSON.stringify(input.extra ?? null),
      request: { headers: input.headers ?? {}, ip: input.ip ?? undefined },
    });
    return allowed;
  } catch {
    return false; // configured but unreachable/erroring -- fail closed, this was opted into
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
// usual always-allow fallback: the client already committed to an encrypted body that only
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

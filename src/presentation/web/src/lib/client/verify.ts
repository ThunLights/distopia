import { parseErrRes } from "#lib/client/error.js";
import { Toast } from "#lib/client/toast.js";
import {
  ENCRYPTED_BODY_HEADER,
  ENCRYPTED_BODY_VALUE,
  type PostBody,
} from "#lib/shared/types/routes/api/verify.js";
import type { VerifyClientPlugin } from "distopia";

// The script and optional wasm are served from build-asset-lookalike paths
// (routes/immutable/chunks/[name].js, routes/immutable/assets/[name].wasm) under a random
// per-page-load name. Both collect() (anti-bot signal) and the optional encrypt() (body
// obfuscation) come from this one module.
type ClientPluginBundle = { name: string; hasWasm: boolean };

async function loadClientPlugin(
  bundle: ClientPluginBundle | null,
): Promise<VerifyClientPlugin | null> {
  if (!bundle) {
    return null;
  }

  const mod = (await import(/* @vite-ignore */ `/immutable/chunks/${bundle.name}.js`)) as {
    default: VerifyClientPlugin;
  };
  const wasm = bundle.hasWasm
    ? await (await fetch(`/immutable/assets/${bundle.name}.wasm`)).arrayBuffer()
    : null;
  await mod.default.init?.(wasm);
  return mod.default;
}

export async function verifyGuild(
  guildId: string,
  turnstileToken: string,
  bundle: ClientPluginBundle | null,
): Promise<boolean> {
  const plugin = await loadClientPlugin(bundle);
  const extra = await plugin?.collect();
  const json = JSON.stringify({ guildId, turnstileToken, extra } satisfies PostBody);
  const encrypted = plugin?.encrypt ? plugin.encrypt(json) : null;

  const response = await fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      ...(encrypted !== null ? { [ENCRYPTED_BODY_HEADER]: ENCRYPTED_BODY_VALUE } : {}),
    },
    body: encrypted ?? json,
  });

  if (response.status === 200) {
    Toast.success("認証が完了しました。");
    return true;
  }

  await parseErrRes(response);
  return false;
}

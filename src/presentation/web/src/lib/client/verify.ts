import { parseErrRes } from "$lib/client/error";
import { Toast } from "$lib/client/toast";
import {
  ENCRYPTED_BODY_HEADER,
  ENCRYPTED_BODY_VALUE,
  type PostBody,
} from "$lib/shared/types/routes/api/verify";
import type { VerifyClientPlugin } from "distopia";

// The script (and optional wasm) is inlined into the SSR'd page by the verify route's load, so
// there is no separate plugin URL to find or block. Both collect() (anti-bot signal) and the
// optional encrypt() (body obfuscation) come from this one module.
type ClientPluginBundle = { code: string; wasm: string | null };

function base64ToBuffer(base64: string): ArrayBuffer {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

async function loadClientPlugin(
  bundle: ClientPluginBundle | null,
): Promise<VerifyClientPlugin | null> {
  if (!bundle) {
    return null;
  }

  const blobUrl = URL.createObjectURL(new Blob([bundle.code], { type: "text/javascript" }));
  try {
    const mod = (await import(/* @vite-ignore */ blobUrl)) as { default: VerifyClientPlugin };
    await mod.default.init?.(bundle.wasm ? base64ToBuffer(bundle.wasm) : null);
    return mod.default;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
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

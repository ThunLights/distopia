import { parseErrRes } from "$lib/client/error";
import { Toast } from "$lib/client/toast";
import {
  ENCRYPTED_BODY_HEADER,
  ENCRYPTED_BODY_VALUE,
  type PostBody,
} from "$lib/shared/types/routes/api/verify";
import type { VerifyClientPlugin } from "distopia";

// Fetched (not statically imported) so this works whether or not a private plugin is
// configured on this deployment -- see lib/server/verifyPlugin.ts for the server-side half
// of the same reasoning. Both collect() (anti-bot signal) and the optional encrypt() (body
// obfuscation, e.g. a private R25A/R25B-style cipher) come from this one module so a plugin
// author only has to ship one script.
async function loadClientPlugin(): Promise<VerifyClientPlugin | null> {
  const response = await fetch("/api/verify/plugin");
  if (!response.ok) {
    return null;
  }

  const code = await response.text();
  const blobUrl = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  try {
    const mod = (await import(/* @vite-ignore */ blobUrl)) as { default: VerifyClientPlugin };
    return mod.default;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export async function verifyGuild(guildId: string, turnstileToken: string): Promise<boolean> {
  const plugin = await loadClientPlugin();
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

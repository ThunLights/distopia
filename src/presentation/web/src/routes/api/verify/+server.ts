import { env } from "$env/dynamic/private";
import { core } from "$lib/server/core";
import { errorJson } from "$lib/server/res";
import { decryptPluginBody, evaluateVerifyPlugin, pluginHeaders } from "$lib/server/verifyPlugin";
import {
  ENCRYPTED_BODY_HEADER,
  ENCRYPTED_BODY_VALUE,
  PostBodySchema,
} from "$lib/shared/types/routes/api/verify";
import type { RequestEvent, RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { safeFetch, safeUrl } from "infra-http";

const TURNSTILE_SITEVERIFY_URL = safeUrl`https://challenges.cloudflare.com/turnstile/v0/siteverify`;

// getClientAddress() can throw (SvelteKit's docs call this out for some adapters/hosts) --
// treated as "couldn't determine it" rather than failing the whole request over it. Whether
// this is the real client IP or a reverse proxy's depends on the deployment's own
// trust-proxy configuration; that's not this repo's concern, only the (optional, private)
// plugin's.
function clientIp(e: RequestEvent): string | null {
  try {
    return e.getClientAddress();
  } catch {
    return null;
  }
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const result = await safeFetch(TURNSTILE_SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: token }).toString(),
  });

  if (result instanceof Error) {
    return false;
  }

  // safeFetch resolves to a Response for any HTTP status, including a 5xx error page from
  // Cloudflare that isn't JSON -- treat both as a normal verification failure, not a thrown
  // 500 out of this handler.
  if (!result.ok) {
    return false;
  }
  try {
    const data = (await result.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// Not authAndValidateHandler -- the body isn't always plain JSON here (see
// lib/client/verify.ts), so this does the same "auth before body validity" check by hand.
export const POST: RequestHandler = async (e) => {
  const { user } = e.locals;
  if (!user) {
    return errorJson("Invalid User");
  }

  const text = await e.request.text();
  const isPluginEncrypted = e.request.headers.get(ENCRYPTED_BODY_HEADER) === ENCRYPTED_BODY_VALUE;
  const pluginRequestContext = { headers: pluginHeaders(e.request.headers), ip: clientIp(e) };

  let parsedJson: unknown;
  try {
    if (isPluginEncrypted) {
      // The client only sets this when a loaded plugin actually encrypted the body, so a
      // decrypt failure here is a real error (bad/missing plugin config), not the usual
      // always-allow fallback for "no plugin at all".
      const decrypted = await decryptPluginBody(text, pluginRequestContext);
      if (decrypted === null) {
        return errorJson("Invalid Body");
      }
      parsedJson = JSON.parse(decrypted);
    } else {
      parsedJson = JSON.parse(text);
    }
  } catch {
    return errorJson("Invalid Body");
  }

  const result = PostBodySchema.safeParse(parsedJson);
  if (!result.success) {
    return errorJson(
      "Invalid Body: " + result.error.issues.map(({ message }) => message).join("; "),
    );
  }
  const body = result.data;

  const setting = await core.verify.getSetting(body.guildId);
  if (!setting?.enabled || !setting.roleId) {
    return errorJson("認証は有効になっていません");
  }

  const guilds = await core.oauth2.getGuilds(user.id);
  if (!guilds?.some((guild) => guild.id === body.guildId)) {
    return errorJson("対象サーバーのメンバーではありません");
  }

  if (!(await verifyTurnstile(body.turnstileToken))) {
    await core.verify.logResult({
      userId: user.id,
      guildId: body.guildId,
      success: false,
      fingerprint: body.extra,
    });
    return errorJson("認証に失敗しました");
  }

  const allowed = await evaluateVerifyPlugin({
    guildId: body.guildId,
    userId: user.id,
    extra: body.extra,
    ...pluginRequestContext,
  });
  if (!allowed) {
    await core.verify.logResult({
      userId: user.id,
      guildId: body.guildId,
      success: false,
      fingerprint: body.extra,
    });
    return errorJson("認証に失敗しました");
  }

  try {
    await core.state.discord.role.give(body.guildId, user.id, setting.roleId);
    if (setting.pendingRoleId) {
      await core.state.discord.role.deprive(body.guildId, user.id, setting.pendingRoleId);
    }
  } catch (error) {
    console.error(`[verify] failed to grant role in ${body.guildId}`, error);
    return errorJson("ロールの付与に失敗しました");
  }

  await core.verify.logResult({
    userId: user.id,
    guildId: body.guildId,
    success: true,
    fingerprint: body.extra,
  });
  return json({ content: "ok" });
};

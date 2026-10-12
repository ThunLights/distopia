import { env } from "$env/dynamic/private";
import { core } from "$lib/server/core";
import { errorJson } from "$lib/server/res";
import { decryptPluginBody, evaluateVerifyPlugin, pluginHeaders } from "$lib/server/verifyPlugin";
import {
  ENCRYPTED_BODY_HEADER,
  ENCRYPTED_BODY_VALUE,
  PostBodySchema,
} from "$lib/shared/types/routes/api/verify";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { safeFetch, safeUrl } from "infra-http";

const TURNSTILE_SITEVERIFY_URL = safeUrl`https://challenges.cloudflare.com/turnstile/v0/siteverify`;

async function verifyTurnstile(token: string): Promise<boolean> {
  const result = await safeFetch(TURNSTILE_SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: token }).toString(),
  });

  if (result instanceof Error) {
    return false;
  }

  const data = (await result.json()) as { success: boolean };
  return data.success;
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

  let parsedJson: unknown;
  try {
    if (isPluginEncrypted) {
      // The client only sets this when a loaded plugin actually encrypted the body, so a
      // decrypt failure here is a real error (bad/missing plugin config), not the usual
      // always-allow fallback for "no plugin at all".
      const decrypted = await decryptPluginBody(text);
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
    headers: pluginHeaders(e.request.headers),
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

  await core.state.discord.role.give(body.guildId, user.id, setting.roleId);
  if (setting.pendingRoleId) {
    await core.state.discord.role.deprive(body.guildId, user.id, setting.pendingRoleId);
  }

  await core.verify.logResult({
    userId: user.id,
    guildId: body.guildId,
    success: true,
    fingerprint: body.extra,
  });
  return json({ content: "ok" });
};

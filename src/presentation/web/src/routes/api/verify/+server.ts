import { core } from "$lib/server/core";
import { errorJson } from "$lib/server/res";
import { decryptPluginBody, evaluateVerify, pluginHeaders } from "$lib/server/verifyPlugin";
import {
  ENCRYPTED_BODY_HEADER,
  ENCRYPTED_BODY_VALUE,
  PostBodySchema,
} from "$lib/shared/types/routes/api/verify";
import type { RequestEvent, RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import type { GuildVerify, UserVerifyLog } from "infra-database/types";

// Behind Cloudflare Tunnel the socket peer is cloudflared, so the real client IP comes from
// CF-Connecting-IPv6 (the real address when Pseudo IPv4 overwrites CF-Connecting-IP), then
// CF-Connecting-IP / CF-Pseudo-IPv4 (set by Cloudflare). Falls back to
// getClientAddress(), which can throw on some adapters/hosts -- treated as "couldn't determine".
function clientIp(e: RequestEvent): string | null {
  const cfIp =
    e.request.headers.get("cf-connecting-ipv6")?.trim() ||
    e.request.headers.get("cf-connecting-ip")?.trim() ||
    e.request.headers.get("cf-pseudo-ipv4")?.trim();
  if (cfIp) {
    return cfIp;
  }

  try {
    return e.getClientAddress();
  } catch {
    return null;
  }
}

// Posts one log entry per verify attempt to the admin-configured log channel -- a no-op when
// unset. Built here (not in app-core's Verify.ts) so app-core doesn't need a discord.js
// dependency just for this one JSON-shaped embed. The email and IP are shown in full, so the
// log channel should be admin-only; the IP is shown only here, never persisted in
// UserVerifyLog, and Discord keeps its own copy of the message.
async function postVerifyLog(
  setting: GuildVerify,
  row: UserVerifyLog,
  reason: string | null,
  { ip, headers }: { ip: string | null; headers: Record<string, string> },
): Promise<void> {
  if (!setting.logChannelId) {
    return;
  }

  const fields: { name: string; value: string }[] = [
    { name: "ユーザー", value: `<@${row.userId}> (${row.userId})` },
    { name: "結果", value: row.success ? "✅ 成功" : "❌ 失敗" },
  ];

  if (reason) {
    fields.push({ name: "拒否理由", value: reason });
  }

  if (row.email) {
    fields.push({ name: "メールアドレス", value: row.email });
  }

  if (ip) {
    fields.push({ name: "IPアドレス", value: ip });
  }

  const country = headers["cf-ipcountry"];
  if (country) {
    fields.push({ name: "国", value: country });
  }

  const ray = headers["cf-ray"];
  if (ray) {
    fields.push({ name: "CF-Ray", value: ray });
  }

  if (row.isVpn || row.isProxy || row.isTor) {
    const flags = [row.isVpn && "VPN", row.isProxy && "Proxy", row.isTor && "Tor"]
      .filter(Boolean)
      .join(", ");
    fields.push({
      name: "VPN/Proxy検知",
      value: row.vpnProvider ? `${flags} (${row.vpnProvider})` : flags,
    });
  }

  if (row.relatedUserIds.length > 0) {
    // Discord embed field values cap at 1024 chars -- exceeding it rejects the whole embed,
    // losing the log entry entirely (exactly for the highest-signal case: lots of related
    // accounts). ~45 chars/entry means >1024 chars by ~23 entries; cap well under that.
    const MAX_SHOWN = 15;
    const shown = row.relatedUserIds.slice(0, MAX_SHOWN).map((id) => `<@${id}> (${id})`);
    if (row.relatedUserIds.length > MAX_SHOWN) {
      shown.push(`…他 ${row.relatedUserIds.length - MAX_SHOWN} 件`);
    }
    fields.push({ name: "サブ垢の可能性", value: shown.join("\n") });
  }

  try {
    await core.state.discord.message.send(setting.logChannelId, [
      {
        color: row.success ? 0x57f287 : 0xed4245,
        fields,
        timestamp: row.createdAt.toISOString(),
      },
    ]);
  } catch (error) {
    // Best-effort notification -- a missing channel/permission must never fail the
    // verification response the user is actually waiting on.
    console.error(`[verify] failed to post log to ${setting.logChannelId}`, error);
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
      // decrypt failure here is a real error (bad/missing plugin config).
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
  // Only a body the plugin actually decrypted may contribute a fingerprint; a plain-JSON body
  // is attacker-controlled and must never be stored or evaluated as one.
  const extra = isPluginEncrypted ? body.extra : undefined;

  const setting = await core.verify.getSetting(body.guildId);
  if (!setting?.enabled || !setting.roleId) {
    return errorJson("認証は有効になっていません");
  }

  const guilds = await core.oauth2.getGuilds(user.id);
  if (!guilds?.some((guild) => guild.id === body.guildId)) {
    return errorJson("対象サーバーのメンバーではありません");
  }

  // Captured once up front so every outcome's log entry carries it.
  const userDiscord = await core.state.database.userDiscord.find(user.id);
  const email = userDiscord?.email ?? null;
  const outcome = await evaluateVerify({
    guildId: body.guildId,
    userId: user.id,
    extra,
    turnstileToken: body.turnstileToken,
    blockVpn: setting.blockVpn,
    ...pluginRequestContext,
  });
  const vpnLogFields = {
    isVpn: outcome.isVpn,
    isProxy: outcome.isProxy,
    isTor: outcome.isTor,
    vpnProvider: outcome.vpnProvider,
  };

  if (!outcome.allowed) {
    const row = await core.verify.logResult({
      userId: user.id,
      guildId: body.guildId,
      success: false,
      fingerprint: extra,
      email,
      ...vpnLogFields,
    });
    await postVerifyLog(setting, row, outcome.reason, pluginRequestContext);
    return errorJson(`認証に失敗しました: ${outcome.reason ?? "Unknown reason"}`);
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

  const row = await core.verify.logResult({
    userId: user.id,
    guildId: body.guildId,
    success: true,
    fingerprint: extra,
    email,
    ...vpnLogFields,
  });
  await postVerifyLog(setting, row, null, pluginRequestContext);
  return json({ content: "ok" });
};

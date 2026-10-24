import { logVerifyResult } from "app-core/VerifyLog";
import type { VerifyRequestContext } from "distopia";
import type { DatabaseClient } from "infra-database/types";
import z from "zod";

import type { BotClient } from "./bot";
import { evaluate } from "./checks";
import { postVerifyLog } from "./log";
import * as plugin from "./plugin";

// Cloudflare documents Turnstile tokens as at most 2048 characters. The body cap is far above any
// real fingerprint payload; it only stops an oversized request from being decrypted/parsed.
const MAX_BODY_LENGTH = 100_000;
const SNOWFLAKE = /^\d{1,20}$/;

const PostBodySchema = z.object({
  guildId: z.string().regex(SNOWFLAKE),
  turnstileToken: z.string().min(1).max(2048),
  extra: z.unknown().optional(),
});

export type SubmitDeps = {
  database: Pick<DatabaseClient, "guildVerify" | "userDiscord" | "userVerifyLog">;
  fetchGuilds: (accessToken: string) => Promise<{ id: string }[] | null>;
  bot: BotClient;
  turnstileSecret: string;
};

export type SubmitInput = {
  userId: string;
  body: string;
  encrypted: boolean;
  request: VerifyRequestContext;
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): SubmitResult => ({ ok: false, error });

async function parseBody(input: SubmitInput) {
  if (input.body.length > MAX_BODY_LENGTH) {
    return fail("Invalid Body");
  }

  let json: unknown;
  try {
    if (input.encrypted) {
      // The client only sets this when a loaded plugin actually encrypted the body, so a
      // decrypt failure here is a real error (bad/missing plugin config).
      const decrypted = await plugin.decrypt(input.body, input.request);
      if (decrypted === null) {
        return fail("Invalid Body");
      }
      json = JSON.parse(decrypted);
    } else {
      json = JSON.parse(input.body);
    }
  } catch {
    return fail("Invalid Body");
  }

  const result = PostBodySchema.safeParse(json);
  return result.success
    ? result.data
    : fail("Invalid Body: " + result.error.issues.map(({ message }) => message).join("; "));
}

export async function submit(deps: SubmitDeps, input: SubmitInput): Promise<SubmitResult> {
  const { database, bot } = deps;
  const { userId, request } = input;

  if (!SNOWFLAKE.test(userId)) {
    return fail("Invalid User");
  }

  const body = await parseBody(input);
  if ("ok" in body) {
    return body;
  }

  // Only a body the plugin actually decrypted may contribute a fingerprint; a plain-JSON body
  // is attacker-controlled and must never be stored or evaluated as one.
  const extra = input.encrypted ? body.extra : undefined;

  const setting = await database.guildVerify.find(body.guildId);
  if (!setting?.enabled || !setting.roleId) {
    return fail("認証は有効になっていません");
  }

  const userDiscord = await database.userDiscord.find(userId);
  const guilds = userDiscord ? await deps.fetchGuilds(userDiscord.accessToken) : null;
  if (!guilds?.some((guild) => guild.id === body.guildId)) {
    return fail("対象サーバーのメンバーではありません");
  }

  // Captured once up front so every outcome's log entry carries it.
  const email = userDiscord?.email ?? null;
  const outcome = await evaluate({
    guildId: body.guildId,
    userId,
    extra: extra ?? null,
    turnstileToken: body.turnstileToken,
    blockVpn: setting.blockVpn,
    turnstileSecret: deps.turnstileSecret,
    request,
  });
  const logFields = {
    userId,
    guildId: body.guildId,
    fingerprint: extra,
    email,
    isVpn: outcome.vpn.isVpn,
    isProxy: outcome.vpn.isProxy,
    isTor: outcome.vpn.isTor,
    vpnProvider: outcome.vpn.provider ?? null,
  };

  if (!outcome.allowed) {
    const row = await logVerifyResult(database, { ...logFields, success: false });
    await postVerifyLog(bot, setting, row, outcome.reason, request);
    return fail(`認証に失敗しました: ${outcome.reason}`);
  }

  try {
    await bot.giveRole(body.guildId, userId, setting.roleId);
    if (setting.pendingRoleId) {
      await bot.depriveRole(body.guildId, userId, setting.pendingRoleId);
    }
  } catch (error) {
    console.error(`[verify] failed to grant role in ${body.guildId}`, error);
    return fail("ロールの付与に失敗しました");
  }

  const row = await logVerifyResult(database, { ...logFields, success: true });
  await postVerifyLog(bot, setting, row, null, request);
  return { ok: true };
}

import type { VerifyRequestContext } from "distopia";
import type { GuildVerify, UserVerifyLog } from "infra-database/types";

import type { BotClient } from "./bot";

// Posts one log entry per verify attempt to the admin-configured log channel -- a no-op when
// unset. The email and IP are shown in full, so the log channel should be admin-only; the IP
// is shown only here, never persisted in UserVerifyLog, and Discord keeps its own copy of the
// message.
export async function postVerifyLog(
  bot: BotClient,
  setting: GuildVerify,
  row: UserVerifyLog,
  reason: string | null,
  { ip, headers }: VerifyRequestContext,
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
    await bot.sendMessage(setting.logChannelId, [
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

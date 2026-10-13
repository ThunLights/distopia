import type { GuildVerify, GuildVerifyUpsertInput, UserVerifyLog } from "infra-database/types";

import { Base } from "./Base";
import { FingerprintSchema, fingerprintHashes } from "./utils/fingerprint";

export class Verify extends Base {
  public async getSetting(guildId: string): Promise<GuildVerify | null> {
    const cached = await this.state.memory.guildVerify.get(guildId);
    return cached ?? (await this.state.database.guildVerify.find(guildId));
  }

  public async saveSetting(input: GuildVerifyUpsertInput): Promise<GuildVerify> {
    const setting = await this.state.database.guildVerify.upsert(input);
    await this.state.memory.guildVerify.set(input.guildId, { ...setting, createdAt: new Date() });
    return setting;
  }

  // fingerprint is untrusted input from the browser (see routes/api/verify/+server.ts) --
  // Zod-validated as a well-formed JSON value before use; a malformed value is treated the
  // same as "no fingerprint at all" rather than failing the whole verification attempt. Its
  // shape beyond that is entirely up to the (optional, private) VerifyClientPlugin's
  // collect() (e.g. a fingerprintjs/canvas/gpu split), this repo never interprets it directly.
  // relatedUserIds is computed and frozen into the row at write time (not recomputed later),
  // so each log reflects exactly who else shared at least one signal as of this attempt.
  public async logResult(input: {
    userId: string;
    guildId: string;
    success: boolean;
    fingerprint?: unknown;
    // OAuth2 email on file (UserDiscord.email) and infra-aip's checkVpn result, both already
    // resolved by the caller (routes/api/verify/+server.ts) -- this just persists them
    // alongside the fingerprint signal, it never fetches or checks either itself.
    email?: string | null;
    isVpn?: boolean;
    isProxy?: boolean;
    isTor?: boolean;
    vpnProvider?: string | null;
  }): Promise<UserVerifyLog> {
    const parsed =
      input.fingerprint === undefined ? undefined : FingerprintSchema.safeParse(input.fingerprint);
    const fingerprint = parsed?.success ? parsed.data : undefined;

    const hashes = fingerprintHashes(fingerprint);
    const relatedUserIds = hashes.length
      ? await this.findRelatedUserIds(input.guildId, input.userId, hashes)
      : [];

    return await this.state.database.userVerifyLog.create({
      userId: input.userId,
      guildId: input.guildId,
      success: input.success,
      fingerprint,
      fingerprintHashes: hashes,
      relatedUserIds,
      email: input.email ?? null,
      isVpn: input.isVpn ?? false,
      isProxy: input.isProxy ?? false,
      isTor: input.isTor ?? false,
      vpnProvider: input.vpnProvider ?? null,
    });
  }

  // Best-effort sub-account signal: two verify attempts in the same guild that share at least
  // one fingerprint signal hash are flagged as related. Only as strong as whatever signal the
  // plugin's collect() actually captures -- no plugin (or one that returns nothing) yields no
  // matches.
  private async findRelatedUserIds(
    guildId: string,
    userId: string,
    hashes: string[],
  ): Promise<string[]> {
    const logs = await this.state.database.userVerifyLog.findByFingerprintHashes(guildId, hashes);
    return [...new Set(logs.map((log) => log.userId).filter((id) => id !== userId))];
  }
}

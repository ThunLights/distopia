import type { DatabaseClient, UserVerifyLog } from "infra-database/types";

import { FingerprintSchema, fingerprintHashes } from "./utils/fingerprint";

// fingerprint is untrusted input from the browser (relayed by presentation-web to
// presentation-verify) -- Zod-validated as a well-formed JSON value before use; a malformed
// value is treated the same as "no fingerprint at all" rather than failing the whole
// verification attempt. Its shape beyond that is entirely up to the (optional, private)
// VerifyClientPlugin's collect() (e.g. a fingerprintjs/canvas/gpu split), this repo never
// interprets it directly. relatedUserIds is computed and frozen into the row at write time
// (not recomputed later), so each log reflects exactly who else shared at least one signal as
// of this attempt.
//
// A standalone function over `database` alone (not a method on Verify) because
// presentation-verify records results too and has no AppState to build an AppCore from.
export async function logVerifyResult(
  database: Pick<DatabaseClient, "userVerifyLog">,
  input: {
    userId: string;
    guildId: string;
    success: boolean;
    fingerprint?: unknown;
    // OAuth2 email on file (UserDiscord.email) and infra-aip's checkVpn result, both already
    // resolved by the caller -- this just persists them alongside the fingerprint signal, it
    // never fetches or checks either itself.
    email?: string | null;
    isVpn?: boolean;
    isProxy?: boolean;
    isTor?: boolean;
    vpnProvider?: string | null;
  },
): Promise<UserVerifyLog> {
  const parsed =
    input.fingerprint === undefined ? undefined : FingerprintSchema.safeParse(input.fingerprint);
  const fingerprint = parsed?.success ? parsed.data : undefined;

  const hashes = fingerprintHashes(fingerprint);
  const relatedUserIds = hashes.length
    ? await findRelatedUserIds(database, input.guildId, input.userId, hashes)
    : [];

  return await database.userVerifyLog.create({
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
async function findRelatedUserIds(
  database: Pick<DatabaseClient, "userVerifyLog">,
  guildId: string,
  userId: string,
  hashes: string[],
): Promise<string[]> {
  const logs = await database.userVerifyLog.findByFingerprintHashes(guildId, hashes);
  return [...new Set(logs.map((log) => log.userId).filter((id) => id !== userId))];
}

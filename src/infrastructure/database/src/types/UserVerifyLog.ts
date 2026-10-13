export type UserVerifyLog = {
  id: number;
  userId: string;
  guildId: string;
  success: boolean;
  // A JSON value (or null) read back from the DB's Json column -- already validated at the
  // app-core trust boundary before it was ever written (see utils/fingerprint.ts), so there's
  // no narrower type worth declaring here than unknown.
  fingerprint: unknown;
  fingerprintHashes: string[];
  relatedUserIds: string[];
  // The OAuth2 email on file for this user at the time of this attempt (UserDiscord.email),
  // captured purely for the admin-facing log.
  email: string | null;
  // infra-aip's checkVpn result for this attempt's IP, flattened -- all false/null when the
  // check wasn't run or failed outright.
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  vpnProvider: string | null;
  createdAt: Date;
};

export type UserVerifyLogCreateInput = Pick<UserVerifyLog, "userId" | "guildId" | "success"> & {
  // Must already be a well-formed JSON value (validated upstream) -- see
  // UserVerifyLogTable.create for where this is handed to Prisma's Json column.
  fingerprint?: unknown;
  fingerprintHashes?: string[];
  relatedUserIds?: string[];
  email?: string | null;
  isVpn?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  vpnProvider?: string | null;
};

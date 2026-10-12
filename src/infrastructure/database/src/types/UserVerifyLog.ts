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
  createdAt: Date;
};

export type UserVerifyLogCreateInput = Pick<UserVerifyLog, "userId" | "guildId" | "success"> & {
  // Must already be a well-formed JSON value (validated upstream) -- see
  // UserVerifyLogTable.create for where this is handed to Prisma's Json column.
  fingerprint?: unknown;
  fingerprintHashes?: string[];
  relatedUserIds?: string[];
};

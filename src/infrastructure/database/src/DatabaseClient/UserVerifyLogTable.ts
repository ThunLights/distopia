import type { Prisma } from "../prisma-client/client";
import type { UserVerifyLog, UserVerifyLogCreateInput } from "../types/UserVerifyLog";
import { Base } from "./Base";

export class UserVerifyLogTable extends Base {
  public async create(input: UserVerifyLogCreateInput): Promise<UserVerifyLog> {
    return await this.prisma.userVerifyLog.create({
      // fingerprint is already a validated JSON value by the time it reaches here (see
      // UserVerifyLogCreateInput's own comment) -- this cast just bridges our hand-written
      // `unknown` to Prisma's own Json input type, it isn't bypassing any real validation.
      data: { ...input, fingerprint: input.fingerprint as Prisma.InputJsonValue | undefined },
    });
  }

  // "Shares at least one signal" rather than "matches on every signal" -- two accounts can
  // still share just a GPU fingerprint while differing elsewhere.
  public async findByFingerprintHashes(
    guildId: string,
    fingerprintHashes: string[],
  ): Promise<UserVerifyLog[]> {
    return await this.prisma.userVerifyLog.findMany({
      where: { guildId, fingerprintHashes: { hasSome: fingerprintHashes } },
    });
  }
}

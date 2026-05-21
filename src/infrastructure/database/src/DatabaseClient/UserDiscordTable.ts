import { decrypt, encrypt } from "../TokenEncryption";
import type { UserDiscordUpsertInput } from "../types";
import { Base } from "./Base";

function encryptTokens(input: UserDiscordUpsertInput): UserDiscordUpsertInput {
  return {
    ...input,
    accessToken: encrypt(input.accessToken),
    refreshToken: encrypt(input.refreshToken),
  };
}

function decryptTokens<T extends { accessToken: string; refreshToken: string }>(record: T): T {
  try {
    return {
      ...record,
      accessToken: decrypt(record.accessToken),
      refreshToken: decrypt(record.refreshToken),
    };
  } catch {
    // If decryption fails, return the original data (for backward compatibility
    // with previously stored unencrypted tokens)
    return record;
  }
}

export class UserDiscordTable extends Base {
  public async find(userId: string) {
    const record = await this.prisma.userDiscord.findUnique({ where: { userId } });
    return record ? decryptTokens(record) : null;
  }

  public async findAll() {
    const records = await this.prisma.userDiscord.findMany();
    return records.map(decryptTokens);
  }

  public async upsert(input: UserDiscordUpsertInput) {
    const encrypted = encryptTokens(input);
    const record = await this.prisma.userDiscord.upsert({
      where: { userId: encrypted.userId },
      update: encrypted,
      create: encrypted,
    });
    return decryptTokens(record);
  }

  public async upsertAll(inputs: UserDiscordUpsertInput[]) {
    const encryptedInputs = inputs.map(encryptTokens);
    const records = await this.prisma.$transaction(
      encryptedInputs.map((value) =>
        this.prisma.userDiscord.upsert({
          where: { userId: value.userId },
          update: value,
          create: value,
        }),
      ),
    );
    return records.map(decryptTokens);
  }

  public async delete(userId: string) {
    return await this.prisma.userDiscord.delete({ where: { userId } });
  }

  public async deleteAll(userIds: string[]) {
    return await this.prisma.$transaction(
      userIds.map((userId) => this.prisma.userDiscord.delete({ where: { userId } })),
    );
  }
}

import { randomBytes } from "crypto";

import type { UserWebUpsertInput } from "../types/UserWeb";
import { Base } from "./Base";

export class UserWebTable extends Base {
  public async genKey(): Promise<Uint8Array<ArrayBuffer>> {
    let key = randomBytes(32);

    while (await this.prisma.userWeb.findUnique({ where: { jwtVerifyKey: key } })) {
      key = randomBytes(32);
    }

    return key;
  }

  public async find(userId: string) {
    return await this.prisma.userWeb.findUnique({ where: { userId } });
  }

  public async findAll() {
    return await this.prisma.userWeb.findMany();
  }

  public async updateNewJwtVerifyKey(userId: string) {
    const newKey = await this.genKey();
    await this.prisma.userWeb.upsert({
      where: { userId },
      update: { jwtVerifyKey: newKey },
      create: { userId, jwtVerifyKey: newKey },
    });
    return {
      userId,
      jwtVerifyKey: newKey,
    };
  }

  public async upsert(input: UserWebUpsertInput) {
    return await this.prisma.userWeb.upsert({
      where: { userId: input.userId },
      update: { userId: input.userId, jwtVerifyKey: input.jwtVerifyKey ?? undefined },
      create: {
        ...input,
        jwtVerifyKey: input.jwtVerifyKey ?? (await this.genKey()),
      },
    });
  }

  public async delete(userId: string) {
    return await this.prisma.userWeb.delete({ where: { userId } });
  }
}

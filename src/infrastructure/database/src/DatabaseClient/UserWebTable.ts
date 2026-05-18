import { randomUUID } from "crypto";

import type { UserWebUpsertInput } from "../types/UserWeb";
import { Base } from "./Base";

export class UserWebTable extends Base {
  public async find(userId: string) {
    return await this.prisma.userWeb.findUnique({ where: { userId } });
  }

  public async findAll() {
    return await this.prisma.userWeb.findMany();
  }

  public async updateNewJwtVerifyKey(userId: string) {
    return await this.prisma.userWeb.upsert({
      where: { userId },
      update: { jwtVerifyKey: randomUUID() },
      create: { userId },
    });
  }

  public async upsert(input: UserWebUpsertInput) {
    return await this.prisma.userWeb.upsert({
      where: { userId: input.userId },
      update: input,
      create: input,
    });
  }

  public async delete(userId: string) {
    return await this.prisma.userWeb.delete({ where: { userId } });
  }
}

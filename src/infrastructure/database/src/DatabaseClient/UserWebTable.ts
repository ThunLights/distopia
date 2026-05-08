import { randomUUID } from "crypto";

import type { UserWebUpsertInput } from "../types/UserWeb";
import { Base } from "./Base";

export class UserWebTable extends Base {
  public async find(id: string) {
    return await this.prisma.userWeb.findUnique({ where: { id } });
  }

  public async findAll() {
    return await this.prisma.userWeb.findMany();
  }

  public async updateNewJwtVerifyKey(id: string) {
    return await this.prisma.userWeb.upsert({
      where: { id },
      update: { jwtVerifyKey: randomUUID() },
      create: { id },
    });
  }

  public async upsert(input: UserWebUpsertInput) {
    return await this.prisma.userWeb.upsert({
      where: { id: input.id },
      update: input,
      create: input,
    });
  }

  public async delete(userId: string) {
    return await this.prisma.userWeb.delete({ where: { id: userId } });
  }
}

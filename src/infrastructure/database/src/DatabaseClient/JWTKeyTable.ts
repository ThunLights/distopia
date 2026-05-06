import { randomBytes } from "node:crypto";

import type { JWTKey } from "../types/JWTKey";
import { Base } from "./Base";

export class JWTKeyTable extends Base {
  private async generateNewKey() {
    let key = randomBytes(32);
    while (await this.prisma.jWTKey.findUnique({ where: { key } })) {
      key = randomBytes(32);
    }
    return key;
  }

  public async findAll(): Promise<JWTKey[]> {
    return await this.prisma.jWTKey.findMany();
  }

  public async createNewKey() {
    return await this.prisma.jWTKey.create({
      data: {
        key: await this.generateNewKey(),
        alg: "HS256",
      },
    });
  }

  public async delete(id: number) {
    return await this.prisma.jWTKey.delete({ where: { id } });
  }
}

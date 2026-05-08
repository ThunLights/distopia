import type { UserDiscordUpsertInput } from "../types";
import { Base } from "./Base";

export class UserDiscordTable extends Base {
  public async find(id: string) {
    return await this.prisma.userDiscord.findUnique({ where: { id } });
  }

  public async findAll() {
    return await this.prisma.userDiscord.findMany();
  }

  public async upsert(input: UserDiscordUpsertInput) {
    return await this.prisma.userDiscord.upsert({
      where: { id: input.id },
      update: input,
      create: input,
    });
  }

  public async delete(id: string) {
    return await this.prisma.userDiscord.delete({ where: { id } });
  }
}

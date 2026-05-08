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

  public async upsertAll(inputs: UserDiscordUpsertInput[]) {
    return await this.prisma.$transaction(
      inputs.map((value) =>
        this.prisma.userDiscord.upsert({
          where: { id: value.id },
          update: value,
          create: value,
        }),
      ),
    );
  }

  public async delete(id: string) {
    return await this.prisma.userDiscord.delete({ where: { id } });
  }

  public async deleteAll(ids: string[]) {
    return await this.prisma.$transaction(
      ids.map((id) => this.prisma.userDiscord.delete({ where: { id } })),
    );
  }
}

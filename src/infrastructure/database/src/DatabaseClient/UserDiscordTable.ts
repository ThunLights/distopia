import type { UserDiscordUpsertInput } from "../types";
import { Base } from "./Base";

export class UserDiscordTable extends Base {
  public async find(userId: string) {
    return await this.prisma.userDiscord.findUnique({ where: { userId } });
  }

  public async findAll() {
    return await this.prisma.userDiscord.findMany();
  }

  public async upsert(input: UserDiscordUpsertInput) {
    return await this.prisma.userDiscord.upsert({
      where: { userId: input.userId },
      update: input,
      create: input,
    });
  }

  public async upsertAll(inputs: UserDiscordUpsertInput[]) {
    return await this.prisma.$transaction(
      inputs.map((value) =>
        this.prisma.userDiscord.upsert({
          where: { userId: value.userId },
          update: value,
          create: value,
        }),
      ),
    );
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

import type { User, UserUpdateInput, UserUpsertInput } from "../types/User";
import { Base } from "./Base";

export class UserTable extends Base {
  public async find(userId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  public async update(input: UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { id: input.id },
      data: input,
    });
  }

  public async upsert(input: UserUpsertInput): Promise<User> {
    return await this.prisma.user.upsert({
      where: { id: input.id },
      update: input,
      create: input,
    });
  }

  public async delete(userId: string): Promise<User> {
    return await this.prisma.user.delete({ where: { id: userId } });
  }

  public async increaseBumpCounter(userId: string, num: number = 1): Promise<User> {
    return await this.prisma.user.upsert({
      where: { id: userId },
      update: {
        bumpCounter: {
          increment: num,
        },
      },
      create: {
        id: userId,
        bumpCounter: 1,
      },
    });
  }

  public async ranking(rankingType: "userBump", num: number): Promise<User[]> {
    return await this.prisma.user.findMany({
      orderBy: {
        bumpCounter: rankingType === "userBump" ? "desc" : undefined,
      },
      take: num,
    });
  }
}

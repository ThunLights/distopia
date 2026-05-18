import type { User, UserUpdateInput, UserUpsertInput } from "../types/User";
import { Base } from "./Base";

export class UserTable extends Base {
  public async find(userId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { userId },
    });
  }

  public async update(input: UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { userId: input.userId },
      data: input,
    });
  }

  public async upsert(input: UserUpsertInput): Promise<User> {
    return await this.prisma.user.upsert({
      where: { userId: input.userId },
      update: input,
      create: input,
    });
  }

  public async delete(userId: string): Promise<User> {
    return await this.prisma.user.delete({ where: { userId } });
  }

  public async increaseBumpCounter(userId: string, num: number = 1): Promise<User> {
    return await this.prisma.user.upsert({
      where: { userId },
      update: {
        bumpCounter: {
          increment: num,
        },
      },
      create: {
        userId,
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

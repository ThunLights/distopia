import type { BlackListTarget, BlackListTargetUpsertInput } from "../types/UserBlackList";
import { Base } from "./Base";

export class BlackListTargetTable extends Base {
  public async find(blackListId: number, userId: string): Promise<BlackListTarget | null> {
    return await this.prisma.blackListTarget.findUnique({
      where: { blackListId_userId: { blackListId, userId } },
    });
  }

  public async findAll(blackListId: number): Promise<BlackListTarget[]> {
    return await this.prisma.blackListTarget.findMany({ where: { blackListId } });
  }

  public async findAllByUserId(blackListIds: number[], userId: string): Promise<BlackListTarget[]> {
    return await this.prisma.blackListTarget.findMany({
      where: { userId, blackListId: { in: blackListIds } },
    });
  }

  public async upsert(input: BlackListTargetUpsertInput): Promise<BlackListTarget> {
    return await this.prisma.blackListTarget.upsert({
      where: { blackListId_userId: { blackListId: input.blackListId, userId: input.userId } },
      update: input,
      create: input,
    });
  }

  public async delete(blackListId: number, userId: string): Promise<BlackListTarget> {
    return await this.prisma.blackListTarget.delete({
      where: { blackListId_userId: { blackListId, userId } },
    });
  }
}

import { Prisma } from "../prisma-client/client";
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

  // Returns null (rather than throwing) when the target doesn't exist -- removing an
  // already-removed target is a normal "not found" outcome for callers, not a crash.
  public async delete(blackListId: number, userId: string): Promise<BlackListTarget | null> {
    try {
      return await this.prisma.blackListTarget.delete({
        where: { blackListId_userId: { blackListId, userId } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}

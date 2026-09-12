import { Prisma } from "../prisma-client/client";
import type { UserBlackList } from "../types/UserBlackList";
import { Base } from "./Base";

export class UserBlackListTable extends Base {
  public async find(id: number): Promise<UserBlackList | null> {
    return await this.prisma.userBlackList.findUnique({ where: { id } });
  }

  public async findAllByOwner(ownerId: string): Promise<UserBlackList[]> {
    return await this.prisma.userBlackList.findMany({ where: { ownerId } });
  }

  public async create(ownerId: string, label: string, tags: string[]): Promise<UserBlackList> {
    return await this.prisma.userBlackList.create({ data: { ownerId, label, tags } });
  }

  public async createIfUnderLimit(
    ownerId: string,
    label: string,
    tags: string[],
    maxCount: number,
  ): Promise<UserBlackList | null> {
    // Serializable isolation so two concurrent calls can't both read a count under
    // maxCount and both insert, letting the owner end up over the limit.
    return await this.prisma.$transaction(
      async (tx) => {
        const count = await tx.userBlackList.count({ where: { ownerId } });

        if (count >= maxCount) {
          return null;
        }

        return await tx.userBlackList.create({ data: { ownerId, label, tags } });
      },
      { isolationLevel: "Serializable" },
    );
  }

  public async updateTags(id: number, tags: string[]): Promise<UserBlackList> {
    return await this.prisma.userBlackList.update({ where: { id }, data: { tags } });
  }

  // Returns null (rather than throwing) when the list doesn't exist -- deleting an
  // already-deleted blacklist is a normal "not found" outcome for callers, not a crash.
  public async delete(id: number): Promise<UserBlackList | null> {
    try {
      return await this.prisma.userBlackList.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}

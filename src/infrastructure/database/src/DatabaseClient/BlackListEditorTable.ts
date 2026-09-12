import { Prisma } from "../prisma-client/client";
import type { BlackListEditor, BlackListEditorUpsertInput } from "../types/UserBlackList";
import { Base } from "./Base";

export class BlackListEditorTable extends Base {
  public async find(blackListId: number, userId: string): Promise<BlackListEditor | null> {
    return await this.prisma.blackListEditor.findUnique({
      where: { blackListId_userId: { blackListId, userId } },
    });
  }

  public async findAll(blackListId: number): Promise<BlackListEditor[]> {
    return await this.prisma.blackListEditor.findMany({ where: { blackListId } });
  }

  public async findAllByUserId(userId: string): Promise<BlackListEditor[]> {
    return await this.prisma.blackListEditor.findMany({ where: { userId } });
  }

  public async upsert(input: BlackListEditorUpsertInput): Promise<BlackListEditor> {
    return await this.prisma.blackListEditor.upsert({
      where: { blackListId_userId: { blackListId: input.blackListId, userId: input.userId } },
      update: input,
      create: input,
    });
  }

  // Returns null (rather than throwing) when the editor doesn't exist -- removing an
  // already-removed editor is a normal "not found" outcome for callers, not a crash.
  public async delete(blackListId: number, userId: string): Promise<BlackListEditor | null> {
    try {
      return await this.prisma.blackListEditor.delete({
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

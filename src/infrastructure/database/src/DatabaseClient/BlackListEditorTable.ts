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

  public async delete(blackListId: number, userId: string): Promise<BlackListEditor> {
    return await this.prisma.blackListEditor.delete({
      where: { blackListId_userId: { blackListId, userId } },
    });
  }
}

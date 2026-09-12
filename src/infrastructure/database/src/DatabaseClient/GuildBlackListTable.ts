import { Prisma } from "../prisma-client/client";
import type { GuildBlackList, GuildBlackListUpsertInput } from "../types/UserBlackList";
import { Base } from "./Base";

export class GuildBlackListTable extends Base {
  public async find(guildId: string, blackListId: number): Promise<GuildBlackList | null> {
    return await this.prisma.guildBlackList.findUnique({
      where: { guildId_blackListId: { guildId, blackListId } },
    });
  }

  public async findAll(guildId: string): Promise<GuildBlackList[]> {
    return await this.prisma.guildBlackList.findMany({ where: { guildId } });
  }

  public async findAllByBlackListId(blackListId: number): Promise<GuildBlackList[]> {
    return await this.prisma.guildBlackList.findMany({ where: { blackListId } });
  }

  public async upsert(input: GuildBlackListUpsertInput): Promise<GuildBlackList> {
    return await this.prisma.guildBlackList.upsert({
      where: {
        guildId_blackListId: { guildId: input.guildId, blackListId: input.blackListId },
      },
      update: input,
      create: input,
    });
  }

  // Returns null (rather than throwing) when the application doesn't exist -- unapplying an
  // already-unapplied blacklist is a normal "not found" outcome for callers, not a crash.
  public async delete(guildId: string, blackListId: number): Promise<GuildBlackList | null> {
    try {
      return await this.prisma.guildBlackList.delete({
        where: { guildId_blackListId: { guildId, blackListId } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}

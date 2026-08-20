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

  public async upsert(input: GuildBlackListUpsertInput): Promise<GuildBlackList> {
    return await this.prisma.guildBlackList.upsert({
      where: {
        guildId_blackListId: { guildId: input.guildId, blackListId: input.blackListId },
      },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string, blackListId: number): Promise<GuildBlackList> {
    return await this.prisma.guildBlackList.delete({
      where: { guildId_blackListId: { guildId, blackListId } },
    });
  }
}

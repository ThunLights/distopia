import type { GuildWhiteList, GuildWhiteListUpsertInput } from "../types/GuildWhiteList";
import { Base } from "./Base";

export class GuildWhiteListTable extends Base {
  public async find(guildId: string, targetId: string): Promise<GuildWhiteList | null> {
    return await this.prisma.guildWhiteList.findUnique({
      where: { guildId_targetId: { guildId, targetId } },
    });
  }

  public async findAll(guildId: string): Promise<GuildWhiteList[]> {
    return await this.prisma.guildWhiteList.findMany({
      where: { guildId },
    });
  }

  public async upsert(input: GuildWhiteListUpsertInput): Promise<GuildWhiteList> {
    return await this.prisma.guildWhiteList.upsert({
      where: { guildId_targetId: { guildId: input.guildId, targetId: input.targetId } },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string, targetId: string): Promise<GuildWhiteList> {
    return await this.prisma.guildWhiteList.delete({
      where: { guildId_targetId: { guildId, targetId } },
    });
  }
}

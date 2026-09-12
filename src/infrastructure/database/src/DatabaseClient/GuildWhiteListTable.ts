import { Prisma } from "../prisma-client/client";
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

  // Returns null (rather than throwing) when the entry doesn't exist -- removing an
  // already-removed whitelist entry is a normal "not found" outcome for callers, not a crash.
  public async delete(guildId: string, targetId: string): Promise<GuildWhiteList | null> {
    try {
      return await this.prisma.guildWhiteList.delete({
        where: { guildId_targetId: { guildId, targetId } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}

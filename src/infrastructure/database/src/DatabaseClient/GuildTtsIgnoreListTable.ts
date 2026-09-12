import { Prisma } from "../prisma-client/client";
import type {
  GuildTtsIgnoreList,
  GuildTtsIgnoreListUpsertInput,
  TtsIgnoreIdType,
} from "../types/GuildTtsIgnoreList";
import { Base } from "./Base";

export class GuildTtsIgnoreListTable extends Base {
  public async findAll(guildId: string): Promise<GuildTtsIgnoreList[]> {
    return await this.prisma.guildTtsIgnoreList.findMany({ where: { guildId } });
  }

  public async findAllByType(
    guildId: string,
    idType: TtsIgnoreIdType,
  ): Promise<GuildTtsIgnoreList[]> {
    return await this.prisma.guildTtsIgnoreList.findMany({ where: { guildId, idType } });
  }

  public async upsert(input: GuildTtsIgnoreListUpsertInput): Promise<GuildTtsIgnoreList> {
    return await this.prisma.guildTtsIgnoreList.upsert({
      where: { guildId_targetId: { guildId: input.guildId, targetId: input.targetId } },
      update: input,
      create: input,
    });
  }

  // Returns null (rather than throwing) when the entry doesn't exist -- removing an
  // already-removed ignore entry is a normal "not found" outcome for callers, not a crash.
  public async delete(guildId: string, targetId: string): Promise<GuildTtsIgnoreList | null> {
    try {
      return await this.prisma.guildTtsIgnoreList.delete({
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

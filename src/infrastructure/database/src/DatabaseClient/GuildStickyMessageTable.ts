import { Prisma } from "../prisma-client/client";
import type {
  GuildStickyMessage,
  GuildStickyMessageUpsertInput,
} from "../types/GuildStickyMessage";
import { Base } from "./Base";

export class GuildStickyMessageTable extends Base {
  public async findAll(guildId: string): Promise<GuildStickyMessage[]> {
    return await this.prisma.guildStickyMessage.findMany({
      where: { guildId },
    });
  }

  public async upsert(
    input: GuildStickyMessageUpsertInput & Pick<GuildStickyMessage, "content">,
  ): Promise<GuildStickyMessage> {
    return await this.prisma.guildStickyMessage.upsert({
      where: { guildId_channelId: { guildId: input.guildId, channelId: input.channelId } },
      update: input,
      create: input,
    });
  }

  public async update(input: GuildStickyMessageUpsertInput): Promise<GuildStickyMessage | null> {
    try {
      return await this.prisma.guildStickyMessage.update({
        where: { guildId_channelId: { guildId: input.guildId, channelId: input.channelId } },
        data: input,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  public async delete(guildId: string, channelId: string): Promise<GuildStickyMessage | null> {
    try {
      return await this.prisma.guildStickyMessage.delete({
        where: { guildId_channelId: { guildId, channelId } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}

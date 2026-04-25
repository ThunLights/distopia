import type {
  GuildRecord,
  GuildRecordUpdateInput,
  GuildRecordUpsertInput,
} from "../types/GuildRecord";
import { Base } from "./Base";

export class GuildRecordTable extends Base {
  public async find(guildId: string): Promise<GuildRecord | null> {
    return await this.prisma.guildRecord.findUnique({
      where: { guildId },
    });
  }

  public async update(input: GuildRecordUpdateInput): Promise<GuildRecord> {
    return await this.prisma.guildRecord.update({
      where: { guildId: input.guildId },
      data: input,
    });
  }

  public async upsert(input: GuildRecordUpsertInput): Promise<GuildRecord> {
    return await this.prisma.guildRecord.upsert({
      where: { guildId: input.guildId },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string): Promise<GuildRecord> {
    return await this.prisma.guildRecord.delete({ where: { guildId } });
  }

  public async increaseBumpCounter(guildId: string, num: number = 1): Promise<GuildRecord> {
    return await this.prisma.guildRecord.upsert({
      where: { guildId },
      update: {
        bumpCounter: {
          increment: num,
        },
      },
      create: {
        guildId,
        bumpCounter: 1,
      },
    });
  }
}

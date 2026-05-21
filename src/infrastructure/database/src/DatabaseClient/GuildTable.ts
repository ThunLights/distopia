import type { Guild, GuildUpdateInput, GuildUpsertInput } from "../types/Guild";
import { Base } from "./Base";

export class GuildTable extends Base {
  public async find(guildId: string): Promise<Guild | null> {
    return await this.prisma.guild.findUnique({
      where: { guildId },
    });
  }

  public async findMany(guildIds: string[]) {
    return await this.prisma.$transaction(
      guildIds.map((guildId) => this.prisma.guild.findUnique({ where: { guildId } })),
    );
  }

  public async findWithRecord(guildId: string) {
    const [guild, record] = await this.prisma.$transaction([
      this.prisma.guild.findUnique({ where: { guildId } }),
      this.prisma.guildRecord.findUnique({ where: { guildId } }),
    ]);
    return {
      guild,
      record,
    };
  }

  public async findWithAllRefData(guildId: string) {
    const [guild, record, settings, recordOneDays, reviews] = await this.prisma.$transaction([
      this.prisma.guild.findUnique({ where: { guildId } }),
      this.prisma.guildRecord.findUnique({ where: { guildId } }),
      this.prisma.guildSetting.findUnique({ where: { guildId } }),
      this.prisma.guildRecordOneDay.findMany({ where: { guildId } }),
      this.prisma.guildReview.findMany({ where: { guildId } }),
    ]);
    return {
      guild,
      record,
      settings,
      recordOneDays,
      reviews,
    };
  }

  public async findAllSortedBumpTime(take?: number) {
    return await this.prisma.guild.findMany({
      where: {
        public: true,
      },
      orderBy: {
        bumpTime: "desc",
      },
      take,
    });
  }

  public async findAll(): Promise<Guild[]> {
    return await this.prisma.guild.findMany();
  }

  public async update(input: GuildUpdateInput): Promise<Guild> {
    return await this.prisma.guild.update({
      where: { guildId: input.guildId },
      data: input,
    });
  }

  public async upsert(input: GuildUpsertInput): Promise<Guild> {
    return await this.prisma.guild.upsert({
      where: { guildId: input.guildId },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string): Promise<Guild> {
    return await this.prisma.guild.delete({ where: { guildId } });
  }
}

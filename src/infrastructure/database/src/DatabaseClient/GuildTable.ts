import type { Guild, GuildUpdateInput, GuildUpsertInput } from "../types/Guild";
import type { GuildRecord } from "../types/GuildRecord";
import type { GuildRecordOneDay } from "../types/GuildRecordOneDay";
import type { GuildReview } from "../types/GuildReview";
import type { GuildSetting } from "../types/GuildSetting";
import { Base } from "./Base";

export class GuildTable extends Base {
  public async find(guildId: string): Promise<Guild | null> {
    return await this.prisma.guild.findUnique({
      where: { guildId },
    });
  }

  public async findMany(guildIds: string[]) {
    const rows = await this.prisma.guild.findMany({ where: { guildId: { in: guildIds } } });
    const byId = new Map(rows.map((row) => [row.guildId, row]));
    return guildIds.map((guildId) => byId.get(guildId) ?? null);
  }

  public async findWithRecord(guildId: string) {
    const [guild, record] = await Promise.all([
      this.prisma.guild.findUnique({ where: { guildId } }),
      this.prisma.guildRecord.findUnique({ where: { guildId } }),
    ]);
    return {
      guild,
      record,
    };
  }

  public async findWithAllRefData(
    guildId: string,
    recordOneDaysSince?: Date,
  ): Promise<{
    guild: Guild | null;
    record: GuildRecord | null;
    settings: GuildSetting | null;
    recordOneDays: GuildRecordOneDay[];
    reviews: GuildReview[];
  }> {
    // Plain reads: a batch $transaction would wait for a transaction slot behind the cron's
    // long upsert batches and time out (P2028) under load.
    const [guild, record, settings, recordOneDays, reviews] = await Promise.all([
      this.prisma.guild.findUnique({ where: { guildId } }),
      this.prisma.guildRecord.findUnique({ where: { guildId } }),
      this.prisma.guildSetting.findUnique({ where: { guildId } }),
      this.prisma.guildRecordOneDay.findMany({
        where: { guildId, ...(recordOneDaysSince ? { date: { gte: recordOneDaysSince } } : {}) },
      }),
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

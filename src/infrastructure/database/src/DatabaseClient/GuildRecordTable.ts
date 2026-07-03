import { getRankingActiveRate } from "../prisma-client/sql/getRankingActiveRate";
import { getRankingActiveRateAll } from "../prisma-client/sql/getRankingActiveRateAll";
import { getRankingLevel } from "../prisma-client/sql/getRankingLevel";
import { getRankingLevelAll } from "../prisma-client/sql/getRankingLevelAll";
import type {
  GuildRecord,
  GuildRecordRanking,
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

  public async findAll(): Promise<GuildRecord[]> {
    return await this.prisma.guildRecord.findMany();
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

  public async upsertAll(input: GuildRecordUpsertInput[]) {
    // Sort by guildId so concurrent batches always acquire row locks in the
    // same order, avoiding Postgres deadlocks (40P01) between overlapping
    // cron jobs (e.g. VoiceChannel.update, ActiveRate.update, Record.update
    // all upsert into guildRecord independently).
    const sorted = [...input].sort((a, b) => a.guildId.localeCompare(b.guildId));
    return await this.prisma.$transaction(
      sorted.map((value) =>
        this.prisma.guildRecord.upsert({
          where: { guildId: value.guildId },
          update: value,
          create: value,
        }),
      ),
    );
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

  public async ranking(
    rankingType: "level" | "activeRate",
    num: number,
  ): Promise<GuildRecordRanking[]> {
    return rankingType === "level"
      ? await this.prisma.$queryRawTyped(getRankingLevel(num))
      : await this.prisma.$queryRawTyped(getRankingActiveRate(num));
  }

  public async rankingAll(rankingType: "level" | "activeRate") {
    return rankingType === "level"
      ? await this.prisma.$queryRawTyped(getRankingLevelAll())
      : await this.prisma.$queryRawTyped(getRankingActiveRateAll());
  }
}

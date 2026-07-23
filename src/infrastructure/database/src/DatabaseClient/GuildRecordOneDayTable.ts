import type {
  GuildRecordOneDayUpdateInput,
  GuildRecordOneDayUpsertInput,
} from "../types/GuildRecordOneDay";
import { Base } from "./Base";

export class GuildRecordOneDayTable extends Base {
  public async find(guildId: string, date: Date) {
    return await this.prisma.guildRecordOneDay.findUnique({
      where: { guildId_date: { guildId, date } },
    });
  }

  public async findFixedTimes(guildId: string, gte: Date) {
    return await this.prisma.guildRecordOneDay.findMany({
      where: {
        guildId,
        date: { gte },
      },
    });
  }

  public async findFixedTimesAll(gte: Date) {
    return await this.prisma.guildRecordOneDay.findMany({
      where: {
        date: { gte },
      },
    });
  }

  public async upsert(input: GuildRecordOneDayUpsertInput) {
    return await this.prisma.guildRecordOneDay.upsert({
      where: { guildId_date: { guildId: input.guildId, date: input.date } },
      update: input,
      create: input,
    });
  }

  public async upsertAll(inputs: GuildRecordOneDayUpsertInput[]) {
    // Sort by the unique key so concurrent batches always acquire row locks in
    // the same order, avoiding Postgres deadlocks (40P01) between overlapping
    // cron jobs that upsert overlapping guildId/date sets.
    const sorted = [...inputs].sort(
      (a, b) => a.guildId.localeCompare(b.guildId) || a.date.getTime() - b.date.getTime(),
    );
    return await this.prisma.$transaction(
      sorted.map((value) =>
        this.prisma.guildRecordOneDay.upsert({
          where: { guildId_date: { guildId: value.guildId, date: value.date } },
          update: value,
          create: value,
        }),
      ),
    );
  }

  public async upsertDailyMaxAll(
    inputs: { guildId: string; date: Date; memberCount: number; activeRate: bigint }[],
  ) {
    // Sort by the unique key so concurrent batches always acquire row locks in
    // the same order, avoiding Postgres deadlocks (40P01) between overlapping
    // cron jobs. The GREATEST() comparison happens atomically in the DB on
    // conflict, so overlapping ActiveRate.update() runs can never overwrite a
    // larger value already recorded for the day with a smaller/stale one.
    const sorted = [...inputs].sort(
      (a, b) => a.guildId.localeCompare(b.guildId) || a.date.getTime() - b.date.getTime(),
    );
    return await this.prisma.$transaction(
      sorted.map(
        ({ guildId, date, memberCount, activeRate }) => this.prisma.$executeRaw`
          INSERT INTO "GuildRecordOneDay" ("guildId", "date", "memberCount", "activeRate")
          VALUES (${guildId}, ${date}, ${memberCount}, ${activeRate})
          ON CONFLICT ("guildId", "date") DO UPDATE SET
            "memberCount" = GREATEST("GuildRecordOneDay"."memberCount", EXCLUDED."memberCount"),
            "activeRate" = GREATEST("GuildRecordOneDay"."activeRate", EXCLUDED."activeRate")
        `,
      ),
    );
  }

  public async upsertVcMembers(guildId: string, date: Date, vcMember: string) {
    const data = await this.prisma.guildRecordOneDay.findUnique({
      where: { guildId_date: { guildId, date } },
    });

    const vcMembers = data ? [...new Set(data.vcMembers).add(vcMember)] : [vcMember];

    if (data && data.vcMembers.length === vcMembers.length) {
      return data;
    }

    return await this.prisma.guildRecordOneDay.upsert({
      where: { guildId_date: { guildId, date } },
      update: {
        vcMembers: {
          set: vcMembers,
        },
      },
      create: { guildId, date, vcMembers },
    });
  }

  public async upsertVcMembersAll(inputs: { guildId: string; vcMember: string }[], date: Date) {
    const query: GuildRecordOneDayUpsertInput[] = [];
    const records = new Map(
      (await this.prisma.guildRecordOneDay.findMany({ where: { date } })).map((value) => [
        value.guildId,
        value,
      ]),
    );

    for (const input of inputs) {
      const record = records.get(input.guildId);
      const vcMembers = record
        ? [...new Set(record.vcMembers).add(input.vcMember)]
        : [input.vcMember];
      if (!(record && record.vcMembers.length === vcMembers.length)) {
        query.push({
          guildId: input.guildId,
          date,
          vcMembers,
        });
      }
    }

    // Sort by guildId so concurrent batches always acquire row locks in the
    // same order, avoiding Postgres deadlocks (40P01) between overlapping
    // cron jobs.
    query.sort((a, b) => a.guildId.localeCompare(b.guildId));

    return await this.prisma.$transaction(
      query.map(({ guildId, date, vcMembers }) =>
        this.prisma.guildRecordOneDay.upsert({
          where: { guildId_date: { guildId, date } },
          update: {
            vcMembers: {
              set: vcMembers,
            },
          },
          create: { guildId, date, vcMembers },
        }),
      ),
    );
  }

  public async upsertNewMembers(guildId: string, date: Date, newMember: string) {
    const data = await this.prisma.guildRecordOneDay.findUnique({
      where: { guildId_date: { guildId, date } },
    });

    const newMembers = data ? [...new Set(data.newMembers).add(newMember)] : [newMember];

    if (data && data.newMembers.length === newMembers.length) {
      return data;
    }

    return await this.prisma.guildRecordOneDay.upsert({
      where: { guildId_date: { guildId, date } },
      update: {
        newMembers: {
          set: newMembers,
        },
      },
      create: { guildId, date, newMembers },
    });
  }

  public async upsertNewMessages(guildId: string, date: Date, num: number = 1) {
    return await this.prisma.guildRecordOneDay.upsert({
      where: { guildId_date: { guildId, date } },
      update: {
        newMessages: {
          increment: num,
        },
      },
      create: { guildId, date, newMessages: num },
    });
  }

  public async upsertVcMemberUpperTwoAll(guildIds: string[], date: Date, num: number = 1) {
    // Sort by guildId so concurrent batches always acquire row locks in the
    // same order, avoiding Postgres deadlocks (40P01) between overlapping
    // cron jobs.
    const sortedGuildIds = [...guildIds].sort((a, b) => a.localeCompare(b));
    return await this.prisma.$transaction(
      sortedGuildIds.map((guildId) =>
        this.prisma.guildRecordOneDay.upsert({
          where: { guildId_date: { guildId, date } },
          update: {
            vcMemberUpperTwo: {
              increment: num,
            },
          },
          create: { guildId, date, vcMemberUpperTwo: num },
        }),
      ),
    );
  }

  public async update(input: GuildRecordOneDayUpdateInput) {
    return await this.prisma.guildRecordOneDay.update({
      where: { guildId_date: { guildId: input.guildId, date: input.date } },
      data: input,
    });
  }

  public async delete(guildId: string, date: Date) {
    return await this.prisma.guildRecordOneDay.delete({
      where: { guildId_date: { guildId, date } },
    });
  }
}

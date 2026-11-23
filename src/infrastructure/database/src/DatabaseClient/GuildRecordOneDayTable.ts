import { Prisma } from "../prisma-client/client";
import type {
  GuildRecordOneDayUpdateInput,
  GuildRecordOneDayUpsertInput,
} from "../types/GuildRecordOneDay";
import { Base } from "./Base";
import { buildBulkUpserts } from "./bulkUpsert";

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

  public async upsertAll(inputs: GuildRecordOneDayUpsertInput[]): Promise<void> {
    await this.executeAll(
      buildBulkUpserts({
        table: "GuildRecordOneDay",
        keys: ["guildId", "date"],
        columns: [
          "guildId",
          "date",
          "vcMembers",
          "newMembers",
          "newMessages",
          "vcMemberUpperTwo",
          "memberCount",
          "activeRate",
          "level",
          "point",
        ],
        rows: inputs,
      }),
    );
  }

  public async upsertDailyMaxAll(
    inputs: {
      guildId: string;
      date: Date;
      memberCount: number;
      activeRate: bigint;
      level: bigint;
      point: bigint;
    }[],
  ): Promise<void> {
    // GREATEST() runs atomically in the DB on conflict, so overlapping ActiveRate.update() runs
    // can never overwrite a larger value already recorded for the day with a smaller/stale one.
    const max = <V extends number | bigint>(a: V, b: V) => (a > b ? a : b);
    await this.executeAll(
      buildBulkUpserts({
        table: "GuildRecordOneDay",
        keys: ["guildId", "date"],
        columns: ["guildId", "date", "memberCount", "activeRate", "level", "point"],
        rows: inputs,
        onConflict: (column) =>
          Prisma.sql`GREATEST(${Prisma.raw(`"GuildRecordOneDay"."${column}"`)}, ${Prisma.raw(`EXCLUDED."${column}"`)})`,
        merge: (a, b) => ({
          ...a,
          memberCount: max(a.memberCount, b.memberCount),
          activeRate: max(a.activeRate, b.activeRate),
          level: max(a.level, b.level),
          point: max(a.point, b.point),
        }),
      }),
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

  public async upsertVcMembersAll(
    inputs: { guildId: string; vcMember: string }[],
    date: Date,
  ): Promise<void> {
    // Union in the DB instead of read-modify-write, so members seen by a concurrent writer (or
    // several members of one guild in the same batch) aren't overwritten.
    await this.executeAll(
      buildBulkUpserts({
        table: "GuildRecordOneDay",
        keys: ["guildId", "date"],
        columns: ["guildId", "date", "vcMembers"],
        rows: inputs.map(({ guildId, vcMember }) => ({ guildId, date, vcMembers: [vcMember] })),
        onConflict: () =>
          Prisma.sql`ARRAY(SELECT DISTINCT unnest("GuildRecordOneDay"."vcMembers" || EXCLUDED."vcMembers"))`,
        merge: (a, b) => ({ ...a, vcMembers: [...new Set([...a.vcMembers, ...b.vcMembers])] }),
      }),
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

  public async upsertVcMemberUpperTwoAll(
    guildIds: string[],
    date: Date,
    num: number = 1,
  ): Promise<void> {
    await this.executeAll(
      buildBulkUpserts({
        table: "GuildRecordOneDay",
        keys: ["guildId", "date"],
        columns: ["guildId", "date", "vcMemberUpperTwo"],
        rows: guildIds.map((guildId) => ({ guildId, date, vcMemberUpperTwo: num })),
        onConflict: () =>
          Prisma.sql`"GuildRecordOneDay"."vcMemberUpperTwo" + EXCLUDED."vcMemberUpperTwo"`,
        merge: (a, b) => ({ ...a, vcMemberUpperTwo: a.vcMemberUpperTwo + b.vcMemberUpperTwo }),
      }),
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

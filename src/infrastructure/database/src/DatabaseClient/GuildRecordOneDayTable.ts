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

  public async upsertVcMemberUpperTwo(guildId: string, date: Date, num: number = 1) {
    return await this.prisma.guildRecordOneDay.upsert({
      where: { guildId_date: { guildId, date } },
      update: {
        vcMemberUpperTwo: {
          increment: num,
        },
      },
      create: { guildId, date, vcMemberUpperTwo: num },
    });
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

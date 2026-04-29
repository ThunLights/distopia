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

    return await this.prisma.guildRecordOneDay.upsert({
      where: { guildId_date: { guildId, date } },
      update: {
        vcMembers: {
          set: data ? [...new Set(data.vcMembers).add(vcMember)] : [vcMember],
        },
      },
      create: { guildId, date, vcMembers: [vcMember] },
    });
  }

  public async upsertNewMembers(guildId: string, date: Date, newMember: string) {
    const data = await this.prisma.guildRecordOneDay.findUnique({
      where: { guildId_date: { guildId, date } },
    });

    return await this.prisma.guildRecordOneDay.upsert({
      where: { guildId_date: { guildId, date } },
      update: {
        newMembers: {
          set: data ? [...new Set(data.newMembers).add(newMember)] : [newMember],
        },
      },
      create: { guildId, date, newMembers: [newMember] },
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

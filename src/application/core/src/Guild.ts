import { type User, type Guild as GuildModel, LateLimitError } from "domain-model";
import { useAsync } from "domain-service-core";
import { Prisma } from "infra-database/prelude/prisma";

import { Base } from "./Base";

export class Guild extends Base {
  public async getDraft(guildId: string) {
    const dbData = await this.state.database.guild.findUnique({ where: { guildId } });
    const memoryData = await useAsync(this.state.memory.guildEdit.get)(guildId);
    return {
      description: memoryData?.description ?? dbData?.description ?? undefined,
      nsfw: memoryData?.nsfw ?? dbData?.nsfw,
      public: memoryData?.public ?? dbData?.public,
      tag: memoryData?.tags ?? dbData?.tags,
    };
  }

  public async bump(user: User, guild: GuildModel) {
    const twoHours = 2 * 60 * 60 * 1000;
    const { database, memory } = this.state;
    const latelimit = memory.latelimit.bump;

    const settedDate = await useAsync(latelimit.get)(guild.id);
    const nowDate = new Date();
    if (settedDate) {
      const remainDate = twoHours - (nowDate.getTime() - settedDate.getTime());
      return new LateLimitError(settedDate, remainDate);
    }

    await useAsync(latelimit.set)(guild.id, nowDate);
    setTimeout(() => useAsync(latelimit.delete)(guild.id), twoHours);

    await database.guild.update({
      where: { guildId: guild.id },
      data: {
        bumpTime: nowDate,
      },
    });

    const { bumpCounter: guildBumpCounter } = await database.guildRecord.upsert({
      where: { guildId: guild.id },
      update: {
        bumpCounter: {
          increment: 1,
        },
      },
      create: {
        guildId: guild.id,
      },
    });

    const { bumpCounter: userBumpCounter } = await database.user.upsert({
      where: {
        id: user.id,
      },
      update: {
        bumpCounter: {
          increment: 1,
        },
      },
      create: {
        id: user.id,
        bumpCounter: 1,
      },
    });

    return {
      guildBumpCounter: guildBumpCounter ?? 1,
      userBumpCounter: userBumpCounter ?? 1,
    };
  }

  public async save(
    guildId: string,
    data: Prisma.XOR<Prisma.GuildCreateInput, Prisma.GuildUncheckedCreateInput>,
  ) {
    return await this.state.database.guild.upsert({
      where: { guildId },
      update: data,
      create: data,
    });
  }

  public async find(guildId: string) {
    return await this.state.database.guild.findUnique({
      where: { guildId },
    });
  }
}

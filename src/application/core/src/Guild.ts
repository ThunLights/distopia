import { type User, type Guild as GuildModel, LateLimitError } from "domain-model";

import { Base } from "./Base";

export class Guild extends Base {
  public async bump(user: User, guild: GuildModel) {
    const twoHours = 2 * 60 * 60 * 1000;
    const { database, memory } = this.state;
    const latelimit = memory.latelimit.bump;

    const settedDate = latelimit.get(guild.id);
    const nowDate = new Date();
    if (settedDate) {
      const remainDate = twoHours - (nowDate.getTime() - settedDate.getTime());
      return new LateLimitError(settedDate, remainDate);
    }

    latelimit.set(guild.id, nowDate);

    await database.guild.update({
      where: { guildId: guild.id },
      data: {
        bumpTime: nowDate,
      },
    });

    const { bumpCounter } = await database.user.upsert({
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

    return { bumpCounter };
  }
}

import { type User, type Guild as GuildModel, LateLimitError } from "domain-model";
import { useAsync } from "domain-service";
import type { GuildSettingUpsertInput, GuildUpsertInput } from "infra-database/types";

import { Base } from "./Base";

export class Guild extends Base {
  public async getDraft(guildId: string) {
    const dbData = await this.state.database.guild.find(guildId);
    const memoryData = await useAsync(this.state.memory.guildEdit.get)(guildId);
    return {
      description: memoryData?.description ?? dbData?.description ?? undefined,
      nsfw: memoryData?.nsfw ?? dbData?.nsfw,
      pub: memoryData?.pub ?? dbData?.public,
      tag: memoryData?.tags ?? dbData?.tags,
      invite: memoryData?.invite ?? dbData?.invite,
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
      guildId: guild.id,
      bumpTime: nowDate,
    });

    const { bumpCounter: guildBumpCounter } = await database.guildRecord.increaseBumpCounter(
      guild.id,
    );

    const { bumpCounter: userBumpCounter } = await database.user.increaseBumpCounter(user.id);

    return {
      guildBumpCounter: guildBumpCounter ?? 1,
      userBumpCounter: userBumpCounter ?? 1,
    };
  }

  public async save(input: GuildUpsertInput) {
    return await this.state.database.guild.upsert(input);
  }

  public async find(guildId: string) {
    return await this.state.database.guild.find(guildId);
  }

  public async getSetting(guildId: string) {
    return await this.state.database.guildsetting.find(guildId);
  }

  public async saveSetting(input: GuildSettingUpsertInput) {
    return await this.state.database.guildsetting.upsert(input);
  }
}

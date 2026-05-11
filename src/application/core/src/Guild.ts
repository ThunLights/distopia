import { type User, type Guild as GuildModel, LateLimitError } from "domain-model";
import { useAsync } from "domain-service";
import type {
  GuildReviewUpsertInput,
  GuildSettingUpsertInput,
  GuildUpsertInput,
} from "infra-database/types";
import type { Value } from "repo-memory/GuildEdit";

import { Base } from "./Base";

export class Guild extends Base {
  public async removeUnJoinedGuildData() {
    for (const { guildId } of await this.state.database.guild.findAll()) {
      if (!(await this.state.discord.guild.isJoined(guildId))) {
        const limit = this.state.memory.unJoinedGuild.get(guildId);
        if (limit) {
          if (Date.now() > limit.getTime()) {
            await this.state.database.guild.delete(guildId);
            this.state.memory.unJoinedGuild.delete(guildId);
          }
        } else {
          this.state.memory.unJoinedGuild.set(guildId, new Date(Date.now() + 8 * 60 * 60 * 1000));
        }
      }
    }
  }

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

  public async saveDraft(guildId: string, value: Value, updateAll: boolean = true) {
    const memoryData = await useAsync(this.state.memory.guildEdit.get)(guildId);
    return await useAsync(this.state.memory.guildEdit.set)(
      guildId,
      updateAll ? { ...memoryData, ...value } : value,
    );
  }

  public async deleteDraft(guildId: string) {
    return await useAsync(this.state.memory.guildEdit.delete)(guildId);
  }

  public async isBotJoined(guildId: string) {
    return await this.state.discord.guild.isJoined(guildId);
  }

  public async bump(user: User, guild: GuildModel) {
    const twoHours = 2 * 60 * 60 * 1000;
    const { database, memory } = this.state;
    const latelimit = memory.latelimit.bump;
    const nowDate = new Date();
    const limit = await useAsync(latelimit.get)(guild.id);

    if (limit && limit.getTime() > Date.now()) {
      return new LateLimitError(limit);
    }

    await useAsync(latelimit.set)(guild.id, new Date(nowDate.getTime() + twoHours));

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

  public async isPublic(guildId: string) {
    return Boolean((await this.find(guildId))?.public);
  }

  public async getSetting(guildId: string) {
    return await this.state.database.guildSetting.find(guildId);
  }

  public async saveSetting(input: GuildSettingUpsertInput) {
    return await this.state.database.guildSetting.upsert(input);
  }

  public async saveReview(input: GuildReviewUpsertInput) {
    return await this.state.database.guildReview.upsert(input);
  }

  public async deleteReview(guildId: string, userId: string) {
    return await this.state.database.guildReview.delete(guildId, userId);
  }
}

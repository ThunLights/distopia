import type { User } from "domain-model";
import type { User as DBUser, GuildRecordRanking } from "infra-database/types";

import { Base } from "./Base";

export type UserBumpRanking = (User & DBUser)[];

export class Ranking extends Base {
  private guildLevel: GuildRecordRanking[] = [];
  private guildActiveRate: GuildRecordRanking[] = [];
  private userBump: UserBumpRanking = [];

  public async fetchGuild(rankingType: "level" | "activeRate", num?: number) {
    if (!this.guildLevel.length || !this.guildActiveRate.length) {
      await this.updateCache();
    }

    if (num) {
      return await this.state.database.guildRecord.ranking(rankingType, num);
    }

    return rankingType === "level" ? this.guildLevel : this.guildActiveRate;
  }

  public async fetchUser(_rankingType: "userBump"): Promise<UserBumpRanking> {
    if (!this.userBump.length) {
      await this.updateCache();
    }

    return this.userBump;
  }

  public async updateCache(num: number = 20) {
    this.guildLevel = await this.state.database.guildRecord.ranking("level", num);
    this.guildActiveRate = await this.state.database.guildRecord.ranking("activeRate", num);

    const users: UserBumpRanking = [];

    const dbUsers = await this.state.database.user.ranking("userBump", num);

    for (const user of dbUsers) {
      const discordUserData = await this.state.discord.user.find(user.id);
      if (discordUserData) {
        users.push({ ...discordUserData, ...user });
      }
    }

    this.userBump = users;
  }
}

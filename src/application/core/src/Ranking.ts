import type { GuildRecordRanking } from "infra-database/types";

import { Base } from "./Base";

export type UserBumpRanking = {
  readonly id: string;
  name: string;
  displayName: string;
  globalName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bumpCounter: number | null;
}[];

export type FetchOptions = {
  num?: number;
};

export class Ranking extends Base {
  private guildLevel = new Map<number, GuildRecordRanking[]>();
  private guildActiveRate = new Map<number, GuildRecordRanking[]>();
  private userBump = new Map<number, UserBumpRanking>();

  public async fetchGuild(rankingType: "level" | "activeRate", options?: FetchOptions) {
    const num = options?.num ?? 20;
    const cache =
      rankingType === "level" ? this.guildLevel.get(num) : this.guildActiveRate.get(num);

    if (cache) {
      return cache;
    }

    const data =
      rankingType === "level"
        ? await this.state.database.guildRecord.ranking("level", num)
        : await this.state.database.guildRecord.ranking("activeRate", num);

    if (rankingType === "level") {
      this.guildLevel.set(num, data);
    } else {
      this.guildActiveRate.set(num, data);
    }

    return data;
  }

  public async fetchUser(
    _rankingType: "userBump",
    options?: FetchOptions,
  ): Promise<UserBumpRanking> {
    const num = options?.num ?? 20;
    const cache = this.userBump.get(num);

    if (cache) {
      return cache;
    }

    const users: UserBumpRanking = [];

    const dbUsers = await this.state.database.user.ranking("userBump", num);

    for (const user of dbUsers) {
      const discordUserData = await this.state.discord.user.find(user.id);
      if (discordUserData) {
        const { id, name, displayName, globalName, avatarUrl, bannerUrl } = discordUserData;
        users.push({
          id,
          name,
          displayName,
          globalName,
          avatarUrl,
          bannerUrl,
          bumpCounter: user.bumpCounter,
        });
      }
    }

    this.userBump.set(num, users);

    return users;
  }

  public async cleanCache() {
    this.guildLevel.clear();
    this.guildActiveRate.clear();
    this.userBump.clear();
  }
}

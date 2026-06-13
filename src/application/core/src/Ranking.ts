import type { GuildRecordRanking } from "infra-database/types";

import { Base } from "./Base";
import type { RankingFetchOptions } from "./types/RankingFetchOptions";
import type { UserBumpRanking } from "./types/UserBumpRanking";

export class Ranking extends Base {
  private guildLevel = new Map<number, (GuildRecordRanking & { name: string })[]>();
  private guildActiveRate = new Map<number, (GuildRecordRanking & { name: string })[]>();
  private userBump = new Map<number, UserBumpRanking[]>();

  public async fetchAll(num: number) {
    return {
      guild: {
        level: await this.fetchGuild("level", { num }),
        activeRate: await this.fetchGuild("activeRate", { num }),
      },
      user: {
        bump: await this.fetchUser("userBump", { num }),
      },
    };
  }

  public async fetchGuild(rankingType: "level" | "activeRate", options?: RankingFetchOptions) {
    const num = options?.num ?? 20;
    const cache =
      rankingType === "level" ? this.guildLevel.get(num) : this.guildActiveRate.get(num);

    if (cache) {
      return cache;
    }

    const data = (
      await Promise.all(
        (rankingType === "level"
          ? await this.state.database.guildRecord.ranking("level", num)
          : await this.state.database.guildRecord.ranking("activeRate", num)
        ).map(async (guild) => {
          const meta = await this.state.discord.guild.fetch(guild.guildId);
          return meta ? { ...guild, name: meta.name } : null;
        }),
      )
    ).filter((guild) => guild !== null);

    if (rankingType === "level") {
      this.guildLevel.set(num, data);
    } else {
      this.guildActiveRate.set(num, data);
    }

    return data;
  }

  public async fetchUser(
    _rankingType: "userBump",
    options?: RankingFetchOptions,
  ): Promise<UserBumpRanking[]> {
    const num = options?.num ?? 20;
    const cache = this.userBump.get(num);

    if (cache) {
      return cache;
    }

    const users: UserBumpRanking[] = [];

    const dbUsers = await this.state.database.user.ranking("userBump", num);

    for (const user of dbUsers) {
      const discordUserData = await this.state.discord.user.find(user.userId);
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

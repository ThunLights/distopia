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
    const map = rankingType === "level" ? this.guildLevel : this.guildActiveRate;
    const cache = map.get(num);

    if (cache) {
      return cache;
    }

    const data = await this.loadGuild(rankingType, num);
    map.set(num, data);
    return data;
  }

  private async loadGuild(rankingType: "level" | "activeRate", num: number) {
    return (
      await Promise.all(
        (await this.state.database.guildRecord.ranking(rankingType, num)).map(async (guild) => {
          const meta = await this.state.discord.guild.fetch(guild.guildId);
          return meta ? { ...guild, name: meta.name } : null;
        }),
      )
    ).filter((guild) => guild !== null);
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

    const users = await this.loadUser(num);
    this.userBump.set(num, users);
    return users;
  }

  private async loadUser(num: number) {
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

    return users;
  }

  // Rebuild in place and swap, so readers keep getting the old data instead of a cold miss.
  public async cleanCache() {
    await Promise.all([
      ...[...this.guildLevel.keys()].map(async (num) =>
        this.guildLevel.set(num, await this.loadGuild("level", num)),
      ),
      ...[...this.guildActiveRate.keys()].map(async (num) =>
        this.guildActiveRate.set(num, await this.loadGuild("activeRate", num)),
      ),
      ...[...this.userBump.keys()].map(async (num) =>
        this.userBump.set(num, await this.loadUser(num)),
      ),
    ]);
  }
}

import type { GuildRecordRanking } from "infra-database/types";

import { Base } from "./Base";
import type { RankingFetchOptions } from "./types/RankingFetchOptions";
import type { UserBumpRanking } from "./types/UserBumpRanking";
import type { UserLevelRanking } from "./types/UserLevelRanking";

const WARM_NUM = 100;

export class Ranking extends Base {
  private guildLevel = new Map<number, (GuildRecordRanking & { name: string })[]>();
  private guildActiveRate = new Map<number, (GuildRecordRanking & { name: string })[]>();
  private userBump = new Map<number, UserBumpRanking[]>();
  private userLevel = new Map<number, UserLevelRanking[]>();

  public async fetchAll(num: number) {
    return {
      guild: {
        level: await this.fetchGuild("level", { num }),
        activeRate: await this.fetchGuild("activeRate", { num }),
      },
      user: {
        bump: await this.fetchUser("userBump", { num }),
        // Profile lookups can hit Discord REST; their failure must not take down the other rankings.
        level: await this.fetchUserLevel({ num }).catch((error: unknown) => {
          console.error("[ranking] user level lookup failed", error);
          return [];
        }),
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
    const records = await this.state.database.guildRecord.rankingAll(rankingType);
    const guilds: (GuildRecordRanking & { name: string })[] = [];

    // Guilds the bot has left still have records, so `num` can only be applied after the lookup.
    for (let start = 0; start < records.length && guilds.length < num; start += num) {
      const batch = await Promise.all(
        records.slice(start, start + num).map(async (guild) => {
          const meta = await this.state.discord.guild.fetch(guild.guildId);
          return meta ? { ...guild, name: meta.name } : null;
        }),
      );
      guilds.push(...batch.filter((guild) => guild !== null));
    }

    return guilds.slice(0, num);
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
      const { id, name, displayName, globalName, avatarUrl, bannerUrl } = await this.findProfile(
        user.userId,
      );
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

    return users;
  }

  private async findProfile(userId: string): Promise<Omit<UserBumpRanking, "bumpCounter">> {
    return (
      (await this.state.discord.user.find(userId)) ?? {
        id: userId,
        name: "unknown",
        displayName: "不明なユーザー",
      }
    );
  }

  public async fetchUserLevel(options?: RankingFetchOptions): Promise<UserLevelRanking[]> {
    const num = options?.num ?? 20;
    const cache = this.userLevel.get(num);

    if (cache) {
      return cache;
    }

    const users = await this.loadUserLevel(num);
    this.userLevel.set(num, users);
    return users;
  }

  private async loadUserLevel(num: number) {
    const users: UserLevelRanking[] = [];
    const rows = await this.state.database.memberLevel.findGlobalTop(num);

    // Sequential because a cache miss in the bot is a rate-limited Discord REST call.
    for (const { userId, level, point } of rows) {
      const { name, displayName, avatarUrl } = await this.findProfile(userId);
      users.push({ id: userId, name, displayName, avatarUrl, level, point });
    }

    return users;
  }

  private generation = 0;

  // Rebuild in place and swap, so readers keep getting the old data instead of a cold miss.
  // The 100-entry lists backing /api/ranking are always (re)built, even if nothing read them yet.
  // A refresh that finishes after a newer one started is dropped, and a failed one evicts its
  // key so the next read retries instead of serving stale data until the next tick.
  public async cleanCache() {
    const generation = ++this.generation;
    const refresh = async <T>(map: Map<number, T>, num: number, load: () => Promise<T>) => {
      try {
        const data = await load();
        if (generation === this.generation) {
          map.set(num, data);
        }
      } catch (error) {
        console.error("[ranking] cache refresh failed", error);
        if (generation === this.generation) {
          map.delete(num);
        }
      }
    };
    const nums = (map: Map<number, unknown>) => new Set([...map.keys(), WARM_NUM]);
    await Promise.all([
      ...[...nums(this.guildLevel)].map((num) =>
        refresh(this.guildLevel, num, () => this.loadGuild("level", num)),
      ),
      ...[...nums(this.guildActiveRate)].map((num) =>
        refresh(this.guildActiveRate, num, () => this.loadGuild("activeRate", num)),
      ),
      ...[...nums(this.userBump)].map((num) =>
        refresh(this.userBump, num, () => this.loadUser(num)),
      ),
      ...[...nums(this.userLevel)].map((num) =>
        refresh(this.userLevel, num, () => this.loadUserLevel(num)),
      ),
    ]);
  }
}

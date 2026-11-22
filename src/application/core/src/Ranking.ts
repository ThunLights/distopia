import type { GuildRecordRanking } from "infra-database/types";

import { Base } from "./Base";
import type { RankingFetchOptions } from "./types/RankingFetchOptions";
import type { UserBumpRanking } from "./types/UserBumpRanking";
import type { UserLevelRanking } from "./types/UserLevelRanking";

const WARM_NUM = 100;
const LOOKUP_BATCH_SIZE = 100;
const GUILD_RANKING_TYPES = ["level", "activeRate"] as const;

type GuildRankingType = (typeof GUILD_RANKING_TYPES)[number];

export class Ranking extends Base {
  private guilds = new Map<GuildRankingType, (GuildRecordRanking & { name: string })[]>();
  // Outlives an evicted list, so a failed refresh doesn't report every guild as unranked.
  private guildRanks = new Map<GuildRankingType, Map<string, number>>();
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

  public async fetchGuild(rankingType: GuildRankingType, options?: RankingFetchOptions) {
    const num = options?.num ?? 20;
    const cache = this.guilds.get(rankingType);

    if (cache) {
      return cache.slice(0, num);
    }

    const data = await this.loadGuild(rankingType);
    this.guilds.set(rankingType, data);
    this.indexRanks(rankingType);
    return data.slice(0, num);
  }

  public getGuildRank(rankingType: GuildRankingType, guildId: string) {
    return this.guildRanks.get(rankingType)?.get(guildId);
  }

  private indexRanks(rankingType: GuildRankingType) {
    const guilds = this.guilds.get(rankingType);
    if (guilds) {
      this.guildRanks.set(
        rankingType,
        new Map(guilds.map(({ guildId }, index) => [guildId, index + 1])),
      );
    }
  }

  private async loadGuild(rankingType: GuildRankingType) {
    const records = await this.state.database.guildRecord.rankingAll(rankingType);
    const guilds: (GuildRecordRanking & { name: string })[] = [];

    // Guilds the bot has left still have records. Dropping them before anything is cut or
    // numbered is what keeps every list and every displayed rank in agreement.
    for (let start = 0; start < records.length; start += LOOKUP_BATCH_SIZE) {
      const batch = await Promise.all(
        records.slice(start, start + LOOKUP_BATCH_SIZE).map(async (guild) => {
          const meta = await this.state.discord.guild.fetch(guild.guildId);
          return meta ? { ...guild, name: meta.name } : null;
        }),
      );
      guilds.push(...batch.filter((guild) => guild !== null));
    }

    return guilds;
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
    const refresh = async <K, T>(map: Map<K, T>, key: K, load: () => Promise<T>) => {
      try {
        const data = await load();
        if (generation === this.generation) {
          map.set(key, data);
        }
      } catch (error) {
        console.error("[ranking] cache refresh failed", error);
        if (generation === this.generation) {
          map.delete(key);
        }
      }
    };
    const nums = (map: Map<number, unknown>) => new Set([...map.keys(), WARM_NUM]);
    await Promise.all([
      ...GUILD_RANKING_TYPES.map(async (type) => {
        await refresh(this.guilds, type, () => this.loadGuild(type));
        this.indexRanks(type);
      }),
      ...[...nums(this.userBump)].map((num) =>
        refresh(this.userBump, num, () => this.loadUser(num)),
      ),
      ...[...nums(this.userLevel)].map((num) =>
        refresh(this.userLevel, num, () => this.loadUserLevel(num)),
      ),
    ]);
  }
}

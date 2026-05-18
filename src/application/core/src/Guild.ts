import { type User, type Guild as GuildModel, LateLimitError } from "domain-model";
import type {
  GuildRecordRanking,
  GuildReviewUpsertInput,
  GuildSettingUpsertInput,
  GuildUpsertInput,
} from "infra-database/types";
import type { Value } from "repo-memory/GuildEdit";
import type { SearchOptions } from "repo-search";

import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Record } from "./Record";
import type { GuildMetaData } from "./types/GuildMetaData";
import type { RootPage } from "./types/RootPage";

export class Guild extends Base {
  public readonly rootPage: RootPage = {
    latestGuilds: [],
    activeGuilds: [],
  };

  constructor(
    state: AppState,
    private readonly record: Record,
  ) {
    super(state);
  }

  public async updateRootPage() {
    this.rootPage.latestGuilds = await this.findManySortedBumpTime(40);
    this.rootPage.activeGuilds = await this.findManySortedActiveRate(10);
  }

  public async loadSearchEngine() {
    const guilds = await this.state.database.guild.findAll();
    await this.state.searchEngine.upsertAll(
      guilds.map(({ guildId, name, description, nsfw, tags }) => ({
        guildId,
        name,
        description: description ?? "",
        nsfw,
        tags,
      })),
    );
  }

  public async removeUnJoinedGuildData() {
    for (const { guildId } of await this.state.database.guild.findAll()) {
      if (!(await this.state.discord.guild.isJoined(guildId))) {
        const limit = this.state.memory.unJoinedGuild.get(guildId);
        if (limit) {
          if (Date.now() > limit.getTime()) {
            await this.state.searchEngine.delete(guildId);
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
    const memoryData = this.state.memory.guildEdit.get(guildId);
    return {
      description: memoryData?.description ?? dbData?.description ?? undefined,
      nsfw: memoryData?.nsfw ?? dbData?.nsfw,
      pub: memoryData?.pub ?? dbData?.public,
      tag: memoryData?.tags ?? dbData?.tags,
      invite: memoryData?.invite ?? dbData?.invite,
    };
  }

  public async saveDraft(guildId: string, value: Value, updateAll: boolean = true) {
    const memoryData = this.state.memory.guildEdit.get(guildId);
    return this.state.memory.guildEdit.set(
      guildId,
      updateAll ? { ...memoryData, ...value } : value,
    );
  }

  public async deleteDraft(guildId: string) {
    return this.state.memory.guildEdit.delete(guildId);
  }

  public async isBotJoined(guildId: string) {
    return await this.state.discord.guild.isJoined(guildId);
  }

  public async bump(user: User, guild: GuildModel) {
    const twoHours = 2 * 60 * 60 * 1000;
    const { database, memory } = this.state;
    const latelimit = memory.latelimit.bump;
    const nowDate = new Date();
    const limit = latelimit.get(guild.id);

    if (limit && limit.getTime() > Date.now()) {
      return new LateLimitError(limit);
    }

    latelimit.set(guild.id, new Date(nowDate.getTime() + twoHours));

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

  public async findManySortedBumpTime(take: number) {
    const guilds = await this.state.database.guild.findAllSortedBumpTime(take);
    const guildsWithMeta = (
      await Promise.all(
        guilds.map(async (guild) => {
          const guildMetaData = await this.fetchMetaData(guild.guildId);
          return {
            meta: guildMetaData,
            guild,
          };
        }),
      )
    )
      .filter(({ meta }) => meta !== null)
      .map((guild) => ({ ...guild, meta: guild.meta as GuildMetaData }));

    return guildsWithMeta;
  }

  public async findManySortedActiveRate(take: number) {
    const guilds = await this.state.database.guildRecord.ranking("activeRate", take);
    const guildsWithMeta = (
      await Promise.all(
        guilds.map(async (guild) => {
          const guildMetaData = await this.fetchMetaData(guild.guildId);
          return {
            meta: guildMetaData,
            guild,
          };
        }),
      )
    )
      .filter(({ meta }) => meta !== null)
      .map((guild) => ({ ...guild, meta: guild.meta as GuildMetaData }))
      .map(({ guild, meta }) => ({ guild: { ...guild, tags: guild.tags ?? [] }, meta }));

    return guildsWithMeta;
  }

  public async fetchMetaData(guildId: string): Promise<GuildMetaData | null> {
    const guildMetaData = await this.state.discord.guild.fetch(guildId);
    const serverBoostCount = await this.state.discord.guild.fetchBoostCount(guildId);

    return guildMetaData
      ? {
          ...guildMetaData,
          serverBoostCount: serverBoostCount ?? 0,
        }
      : null;
  }

  public async findWithRecord(guildId: string) {
    const { guild, record } = await this.state.database.guild.findWithRecord(guildId);
    const guildMetaData = await this.fetchMetaData(guildId);

    return {
      meta: guildMetaData,
      guild,
      record: record
        ? {
            ...record,
            rank: {
              activeRate: this.record.getActiveRateRanking(guildId),
              level: this.record.getLevelRank(guildId),
            },
          }
        : null,
    };
  }

  public async findAllWithMetaData(guildIds: string[]) {
    const guilds = (await this.state.database.guild.findMany(guildIds))
      .filter((guild) => guild !== null)
      .filter((guild) => guild.public);
    const guildsWithMeta = (
      await Promise.all(
        guilds.map(async (guild) => {
          const guildMetaData = await this.fetchMetaData(guild.guildId);
          return {
            meta: guildMetaData,
            guild,
          };
        }),
      )
    )
      .filter(({ meta }) => meta !== null)
      .map((guild) => ({ ...guild, meta: guild.meta as GuildMetaData }));

    return guildsWithMeta;
  }

  public async findWithAllRefData(guildId: string) {
    const { guild, record, settings, recordOneDays, reviews } =
      await this.state.database.guild.findWithAllRefData(guildId);
    const guildMetaData = await this.fetchMetaData(guildId);

    return {
      meta: guildMetaData,
      guild,
      record: record
        ? {
            ...record,
            rank: {
              activeRate: this.record.getActiveRateRanking(guildId),
              level: this.record.getLevelRank(guildId),
            },
          }
        : null,
      settings,
      recordOneDays,
      reviews: await Promise.all(
        reviews.map(async ({ userId, star, content, updatedAt }) => {
          const user = await this.state.discord.user.find(userId);

          return {
            userId,
            username: user?.name ?? null,
            avatarUrl: user?.avatarUrl ?? null,
            star,
            content,
            updatedAt,
          };
        }),
      ),
    };
  }

  public async search(term: string, options?: SearchOptions) {
    const { time, hits } = await this.state.searchEngine.search(term, options);

    const guilds = await this.findAllWithMetaData(hits.map(({ guildId }) => guildId));

    return {
      guilds,
      time,
      count: guilds.length,
    };
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

  public async rankingToGuildWithMeta({
    guildId,
    name,
    activeRate,
    level,
    point,
    icon,
  }: GuildRecordRanking) {
    const memberCount = await this.state.discord.guild.fetchMemberCount(guildId);
    const onlineMemberCount = await this.state.discord.guild.fetchMemberCount(guildId, ["online"]);
    return {
      guildId,
      name,
      activeRate,
      level,
      point,
      memberCount: memberCount ?? null,
      onlineMemberCount: onlineMemberCount ?? null,
      iconUrl: icon ? this.iconUrl(guildId, icon) : null,
    };
  }

  public iconUrl(guildId: string, iconHash: string) {
    return this.state.discord.guild.iconUrl(guildId, iconHash);
  }
}

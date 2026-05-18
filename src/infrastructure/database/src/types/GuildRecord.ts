import type { Guild } from "./Guild";

export type GuildRecord = {
  guildId: string;
  maxlevelRank: bigint | null;
  maxRateRank: bigint | null;
  maxRate: bigint | null;
  bumpCounter: number;
  activeRate: bigint | null;
  level: bigint;
  point: bigint;
};

export type GuildRecordUpdateInput = Pick<GuildRecord, "guildId"> & Partial<GuildRecord>;

export type GuildRecordUpsertInput = Pick<GuildRecord, "guildId"> & Partial<GuildRecord>;

export type GuildRecordRanking = GuildRecord & Omit<Guild, "tags"> & { tags: string[] | null };

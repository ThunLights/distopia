export type GuildRecord = {
  guildId: string;
  maxlevelRank: bigint | null;
  maxRateRank: bigint | null;
  MaxRate: bigint | null;
  bumpCounter: number;
  activeRate: bigint | null;
  level: bigint;
  point: bigint;
};

export type GuildRecordUpdateInput = Pick<GuildRecord, "guildId"> & Partial<GuildRecord>;

export type GuildRecordUpsertInput = Pick<GuildRecord, "guildId"> & Partial<GuildRecord>;

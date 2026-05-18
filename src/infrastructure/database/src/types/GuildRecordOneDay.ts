export type GuildRecordOneDay = {
  guildId: string;
  date: Date;
  vcMembers: string[];
  newMembers: string[];
  newMessages: number;
  vcMemberUpperTwo: number;
};

export type GuildRecordOneDayUpsertInput = Pick<GuildRecordOneDay, "date" | "guildId"> &
  Partial<GuildRecordOneDay>;

export type GuildRecordOneDayUpdateInput = Pick<GuildRecordOneDay, "date" | "guildId"> &
  Partial<GuildRecordOneDay>;

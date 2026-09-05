export type GuildDictionary = {
  guildId: string;
  word: string;
  reading: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildDictionaryUpsertInput = Pick<GuildDictionary, "guildId" | "word" | "reading">;

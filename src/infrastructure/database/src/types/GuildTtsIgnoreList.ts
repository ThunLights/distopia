export type TtsIgnoreIdType = "UserId" | "ChannelId";

export type GuildTtsIgnoreList = {
  guildId: string;
  targetId: string;
  idType: TtsIgnoreIdType;
  createdAt: Date;
};

export type GuildTtsIgnoreListUpsertInput = Pick<
  GuildTtsIgnoreList,
  "guildId" | "targetId" | "idType"
>;

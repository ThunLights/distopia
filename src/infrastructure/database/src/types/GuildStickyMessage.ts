export type GuildStickyMessage = {
  guildId: string;
  channelId: string;
  content: string;
  messageId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildStickyMessageUpsertInput = Pick<GuildStickyMessage, "guildId" | "channelId"> &
  Partial<GuildStickyMessage>;

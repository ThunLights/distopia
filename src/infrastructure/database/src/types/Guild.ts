export type Guild = {
  guildId: string;
  invite: string;
  description: string | null;
  registeredAt: Date;
  updatedAt: Date;
  nsfw: boolean;
  public: boolean;
  bumpTime: Date;
  tags: string[];
};

export type GuildUpsertInput = Pick<Guild, "guildId" | "invite"> & Partial<Guild>;

export type GuildUpdateInput = Pick<Guild, "guildId"> & Partial<Guild>;

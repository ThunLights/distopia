export type Guild = {
  name: string;
  guildId: string;
  invite: string;
  icon: string | null;
  banner: string | null;
  description: string | null;
  registeredAt: Date;
  updatedAt: Date;
  nsfw: boolean;
  public: boolean;
  bumpTime: Date;
  tags: string[];
};

export type GuildUpsertInput = Pick<Guild, "name" | "guildId" | "invite"> & Partial<Guild>;

export type GuildUpdateInput = Pick<Guild, "guildId"> & Partial<Guild>;

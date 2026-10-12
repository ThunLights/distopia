export type GuildVerify = {
  guildId: string;
  enabled: boolean;
  channelId: string | null;
  roleId: string | null;
  pendingRoleId: string | null;
};

export type GuildVerifyUpdateInput = Pick<GuildVerify, "guildId"> & Partial<GuildVerify>;

export type GuildVerifyUpsertInput = Pick<GuildVerify, "guildId"> & Partial<GuildVerify>;

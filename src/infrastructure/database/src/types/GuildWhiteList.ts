export type WhiteListIdType = "ChannelId" | "RoleId" | "UserId";

export type WhiteListPermission = "InviteLinkBlock";

export type GuildWhiteList = {
  guildId: string;
  targetId: string;
  idType: WhiteListIdType;
  allPermissions: boolean;
  permissions: WhiteListPermission[];
  createdAt: Date;
  updatedAt: Date;
};

export type GuildWhiteListUpsertInput = Pick<GuildWhiteList, "guildId" | "targetId" | "idType"> &
  Partial<GuildWhiteList>;

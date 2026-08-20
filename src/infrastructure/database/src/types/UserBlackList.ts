export type BlackListPermission = "AddTarget" | "EditTarget" | "RemoveTarget";

export type BlackListAction = "Log" | "Kick" | "Ban";

export type UserBlackList = {
  id: number;
  ownerId: string;
};

export type BlackListTarget = {
  userId: string;
  description: string;
  blackListId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BlackListTargetUpsertInput = Pick<
  BlackListTarget,
  "blackListId" | "userId" | "description"
>;

export type BlackListEditor = {
  blackListId: number;
  userId: string;
  allPermissions: boolean;
  permissions: BlackListPermission[];
  createdAt: Date;
  updatedAt: Date;
};

export type BlackListEditorUpsertInput = Pick<BlackListEditor, "blackListId" | "userId"> &
  Partial<BlackListEditor>;

export type GuildBlackList = {
  guildId: string;
  blackListId: number;
  action: BlackListAction;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildBlackListUpsertInput = Pick<GuildBlackList, "guildId" | "blackListId"> &
  Partial<GuildBlackList>;

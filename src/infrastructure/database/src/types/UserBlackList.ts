export type BlackListPermission = "AddTarget" | "EditTarget" | "RemoveTarget";

export type BlackListAction = "Log" | "Kick" | "Ban";

export type UserBlackList = {
  id: number;
  ownerId: string;
  label: string;
  tags: string[];
};

export type BlackListTarget = {
  userId: string;
  label: string;
  description: string;
  tags: string[];
  blackListId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BlackListTargetUpsertInput = Pick<
  BlackListTarget,
  "blackListId" | "userId" | "label" | "description" | "tags"
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
  banTags: string[];
  logChannel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildBlackListUpsertInput = Pick<GuildBlackList, "guildId" | "blackListId"> &
  Partial<GuildBlackList>;

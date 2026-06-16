export type GuildSetting = {
  guildId: string;
  actingOwner: string | null;
  bumpNotice: boolean;
  bumpNoticeRole: string | null;
  bumpNoticeContent: string | null;
  inviteLinkBlock: boolean | null;
};

export type GuildSettingUpdateInput = Pick<GuildSetting, "guildId"> & Partial<GuildSetting>;

export type GuildSettingUpsertInput = Pick<GuildSetting, "guildId"> & Partial<GuildSetting>;

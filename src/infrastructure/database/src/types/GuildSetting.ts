export type GuildSetting = {
  guildId: string;
  actingOwner: string | null;
  bumpNotice: boolean;
  bumpNoticeRole: string | null;
  bumpNoticeContent: string | null;
  inviteLinkBlock: boolean;
  statChannelAllMembers: string | null;
  statChannelUsers: string | null;
  statChannelBots: string | null;
  statChannelActiveRate: string | null;
  statChannelActiveRateRanking: string | null;
};

export type GuildSettingUpdateInput = Pick<GuildSetting, "guildId"> & Partial<GuildSetting>;

export type GuildSettingUpsertInput = Pick<GuildSetting, "guildId"> & Partial<GuildSetting>;

export type GuildLogSetting = {
  guildId: string;
  logAntiRaid: string | null;
  logMemberJoin: string | null;
  logMemberLeave: string | null;
  logMemberTimeout: string | null;
  logMemberKick: string | null;
  logMemberBan: string | null;
  logMemberUnban: string | null;
  logRoleCreate: string | null;
  logRoleEdit: string | null;
  logRoleDelete: string | null;
  logChannelCreate: string | null;
  logChannelEdit: string | null;
  logChannelDelete: string | null;
  logMessageEdit: string | null;
  logMessageDelete: string | null;
  logVoiceJoin: string | null;
  logVoiceLeave: string | null;
};

export type GuildLogSettingUpsertInput = Pick<GuildLogSetting, "guildId"> &
  Partial<GuildLogSetting>;

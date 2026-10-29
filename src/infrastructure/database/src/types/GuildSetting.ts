export type TtsProvider = "WebVoiceVox" | "SakuraAi";

export type GuildSetting = {
  guildId: string;
  actingOwner: string | null;
  bumpNotice: boolean;
  bumpNoticeRole: string | null;
  bumpNoticeContent: string | null;
  inviteLinkBlock: boolean;
  welcomeMessageChannel: string | null;
  welcomeMessageContent: string | null;
  leaveMessageChannel: string | null;
  leaveMessageContent: string | null;
  statChannelAllMembers: string | null;
  statChannelUsers: string | null;
  statChannelBots: string | null;
  statChannelActiveRate: string | null;
  statChannelActiveRateRanking: string | null;
  ttsDefaultSpeakerId: number | null;
  ttsSkipCommand: string;
  ttsSkipUrl: boolean;
  ttsSkipCodeBlock: boolean;
  ttsProvider: TtsProvider;
};

export type GuildSettingUpdateInput = Pick<GuildSetting, "guildId"> & Partial<GuildSetting>;

export type GuildSettingUpsertInput = Pick<GuildSetting, "guildId"> & Partial<GuildSetting>;

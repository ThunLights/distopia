export type PanelType = "ActiveRateRanking" | "LevelRanking" | "UserBumpRanking";

export type Panel = {
  guildId: string;
  type: PanelType;
  channelId: string;
  messageId: string;
};

export type PanelUpsertInput = Panel;

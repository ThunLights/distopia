import { MapWithGC } from "./MapWithGC";

export type GuildSettingValue = {
  guildId: string;
  actingOwner: string | null;
  bumpNotice: boolean;
  bumpNoticeRole: string | null;
  bumpNoticeContent: string | null;
  inviteLinkBlock: boolean;
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
  statChannelAllMembers: string | null;
  statChannelUsers: string | null;
  statChannelBots: string | null;
  statChannelActiveRate: string | null;
  statChannelActiveRateRanking: string | null;
  createdAt: Date;
};

const twelveHours = 12 * 60 * 60 * 1000;

export class GuildSetting extends MapWithGC<string, GuildSettingValue> {
  public override gc(): void {
    for (const [guildId, value] of this.entries()) {
      if (Date.now() - twelveHours > value.createdAt.getTime()) {
        this.delete(guildId);
      }
    }
  }
}

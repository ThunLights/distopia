import { MapWithGC } from "./MapWithGC";

export type GuildSettingValue = {
  guildId: string;
  actingOwner: string | null;
  bumpNotice: boolean;
  bumpNoticeRole: string | null;
  bumpNoticeContent: string | null;
  inviteLinkBlock: boolean;
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

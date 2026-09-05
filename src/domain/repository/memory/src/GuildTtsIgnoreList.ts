import { MapWithGC } from "./MapWithGC";

export type GuildTtsIgnoreListEntry = {
  guildId: string;
  targetId: string;
  idType: "UserId" | "ChannelId";
  createdAt: Date;
};

export type GuildTtsIgnoreListValue = {
  entries: GuildTtsIgnoreListEntry[];
  createdAt: Date;
};

const twelveHours = 12 * 60 * 60 * 1000;

export class GuildTtsIgnoreList extends MapWithGC<string, GuildTtsIgnoreListValue> {
  public override gc(): void {
    for (const [guildId, value] of this.entries()) {
      if (Date.now() - twelveHours > value.createdAt.getTime()) {
        this.delete(guildId);
      }
    }
  }
}

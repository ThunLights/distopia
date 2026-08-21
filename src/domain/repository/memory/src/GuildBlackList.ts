import { MapWithGC } from "./MapWithGC";

export type GuildBlackListEntry = {
  guildId: string;
  blackListId: number;
  autoBan: boolean;
  banTags: string[];
  logChannel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildBlackListValue = {
  entries: GuildBlackListEntry[];
  createdAt: Date;
};

const twelveHours = 12 * 60 * 60 * 1000;

export class GuildBlackList extends MapWithGC<string, GuildBlackListValue> {
  public override gc(): void {
    for (const [guildId, value] of this.entries()) {
      if (Date.now() - twelveHours > value.createdAt.getTime()) {
        this.delete(guildId);
      }
    }
  }
}

import { MapWithGC } from "./MapWithGC";

export type GuildDictionaryEntry = {
  guildId: string;
  word: string;
  reading: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildDictionaryValue = {
  entries: GuildDictionaryEntry[];
  createdAt: Date;
};

const twelveHours = 12 * 60 * 60 * 1000;

export class GuildDictionary extends MapWithGC<string, GuildDictionaryValue> {
  public override gc(): void {
    for (const [guildId, value] of this.entries()) {
      if (Date.now() - twelveHours > value.createdAt.getTime()) {
        this.delete(guildId);
      }
    }
  }
}

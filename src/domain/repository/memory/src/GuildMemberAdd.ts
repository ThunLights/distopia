import { MapWithGC } from "./MapWithGC";

export type GuildMemberAddValue = {
  memberIds: string[];
  updatedAt: Date;
};

export class GuildMemberAdd extends MapWithGC<string, GuildMemberAddValue> {
  public override gc(): void {
    for (const [key, value] of this.entries()) {
      if (Date.now() - 15 * 60 * 1000 > value.updatedAt.getTime()) {
        this.delete(key);
      }
    }
  }
}

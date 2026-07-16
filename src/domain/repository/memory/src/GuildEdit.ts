import { MapWithGC } from "./MapWithGC";

export type GuildEditValue = {
  description?: string;
  nsfw?: boolean;
  pub?: boolean;
  tags?: string[];
  invite?: string;
  updated: Date;
};

export class GuildEdit extends MapWithGC<string, GuildEditValue> {
  public override gc(): void {
    const nowTime = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;

    for (const [key, value] of this.entries()) {
      if (nowTime > value.updated.getTime() + twoHours) {
        this.delete(key);
      }
    }
  }
}

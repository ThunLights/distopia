import { MapWithGC } from "./MapWithGC";

export type UrlCacheInMemoryValue = {
  isInviteLink: boolean;
  createdAt: Date;
};

const twelveHours = 12 * 60 * 60 * 1000;

export class UrlCacheInMemory extends MapWithGC<string, UrlCacheInMemoryValue> {
  public override gc(): void {
    for (const [url, value] of this.entries()) {
      if (Date.now() - twelveHours > value.createdAt.getTime()) {
        this.delete(url);
      }
    }
  }
}

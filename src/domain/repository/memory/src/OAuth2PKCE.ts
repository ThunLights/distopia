import { MapWithGC } from "./MapWithGC";

export type Value = {
  sessionKey: string;
  createdAt: Date;
};

export class OAuth2PKCE extends MapWithGC<string, Value> {
  public override gc(): void {
    for (const [key, { createdAt }] of this.entries()) {
      if (Date.now() - 20 * 60 * 1000 > createdAt.getTime()) {
        this.delete(key);
      }
    }
  }
}

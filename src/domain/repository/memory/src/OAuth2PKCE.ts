import { MapWithGC } from "./MapWithGC";

export type OAuth2PKCEValue = {
  sessionKey: string;
  createdAt: Date;
};

export class OAuth2PKCE extends MapWithGC<string, OAuth2PKCEValue> {
  public override gc(): void {
    for (const [key, { createdAt }] of this.entries()) {
      if (Date.now() - 20 * 60 * 1000 > createdAt.getTime()) {
        this.delete(key);
      }
    }
  }
}

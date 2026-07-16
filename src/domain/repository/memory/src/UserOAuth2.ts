import { MapWithGC } from "./MapWithGC";

export type UserOAuth2Value = {
  username: string;
  email?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  updatedAt: Date;
};

export class UserOAuth2 extends MapWithGC<string, UserOAuth2Value> {
  public override gc(): void {
    for (const [id, { updatedAt }] of this.entries()) {
      if (Date.now() > updatedAt.getTime() + 10 * 60 * 1000) {
        this.delete(id);
      }
    }
  }
}

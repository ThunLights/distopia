import { Base } from "./Base";

export class AvatarController extends Base {
  public hashToUrl(userId: string, hash: string) {
    return this.client.rest.cdn.avatar(userId, hash);
  }
}

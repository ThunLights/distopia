import type { User } from "../types/User";
import { Base } from "./Base";

export class UserController extends Base {
  public async find(userId: string): Promise<User | null> {
    const user =
      this.client.users.cache.get(userId) ??
      (await this.client.users.fetch(userId, { cache: true }));

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.username,
      displayName: user.displayName,
      globalName: user.globalName ?? undefined,
      avatarUrl: user.avatarURL() ?? undefined,
      bannerUrl: user.bannerURL() ?? undefined,
    };
  }
}

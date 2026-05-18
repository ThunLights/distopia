import type { User as UserModel } from "domain-model";

import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { OAuth2 } from "./OAuth2";

export type UserOAuth2Profile = {
  id: string;
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
};

export class User extends Base {
  constructor(
    state: AppState,
    private readonly oauth2: OAuth2,
  ) {
    super(state);
  }

  public async find(userId: string): Promise<UserModel | null> {
    return await this.state.discord.user.find(userId);
  }

  public async findOAuth2(userId: string) {
    const user = await this.state.database.userDiscord.find(userId);

    if (!user) {
      return null;
    }

    const userOAuth2Data = await this.state.discord.oauth2.fetchUserInfo(user.accessToken);

    if (!userOAuth2Data) {
      return null;
    }

    const { id, email, username, avatarUrl, bannerUrl } = userOAuth2Data;

    this.state.memory.userOAuth2.set(id, {
      email: email ?? undefined,
      username,
      avatarUrl: avatarUrl ?? undefined,
      bannerUrl: bannerUrl ?? undefined,
      updatedAt: new Date(),
    });

    return userOAuth2Data;
  }

  public async findWithOAuth2(userId: string): Promise<UserOAuth2Profile | null> {
    const djsCache = await this.find(userId);
    if (djsCache) {
      const { id, name, avatarUrl, bannerUrl } = djsCache;
      return {
        id,
        username: name,
        avatarUrl,
        bannerUrl,
      };
    }

    const memCache = this.state.memory.userOAuth2.get(userId);
    if (memCache) {
      const { username, avatarUrl, bannerUrl } = memCache;
      return {
        id: userId,
        username,
        avatarUrl,
        bannerUrl,
      };
    }

    const oauth2Data = await this.findOAuth2(userId);

    if (oauth2Data) {
      const { id, username, avatarUrl, bannerUrl } = oauth2Data;
      return {
        id,
        username,
        avatarUrl: avatarUrl ?? undefined,
        bannerUrl: bannerUrl ?? undefined,
      };
    }

    return null;
  }
}

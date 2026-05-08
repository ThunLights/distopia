import { Base } from "./Base";

export class OAuth2 extends Base {
  public async codeToUser(code: string) {
    const tokens = await this.state.discord.oauth2.parseCode(code);

    if (!tokens) {
      return null;
    }

    const { accessToken, refreshToken } = tokens;

    const user = await this.state.discord.oauth2.fetchUserInfo(accessToken);

    if (!user) {
      return null;
    }

    const { id, email, username, avatarUrl, bannerUrl } = user;

    await this.state.database.userDiscord.upsert({
      id: user.id,
      accessToken,
      refreshToken,
      email: user.email,
    });
    this.state.memory.userOAuth2.set(id, {
      email: email ?? undefined,
      username,
      avatarUrl: avatarUrl ?? undefined,
      bannerUrl: bannerUrl ?? undefined,
      updatedAt: new Date(),
    });

    return user;
  }

  public async findUser(userId: string) {
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
}

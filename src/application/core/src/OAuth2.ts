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

    await this.state.database.userDiscord.upsert({ id: user.id, accessToken, refreshToken });

    return user;
  }
}

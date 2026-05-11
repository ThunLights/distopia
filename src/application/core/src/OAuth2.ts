import type { UserDiscordUpsertInput } from "infra-database/types";
import type { Guilds } from "repo-memory/OAuth2Guilds";

import { Base } from "./Base";

export class OAuth2 extends Base {
  public async updateTokens() {
    const upsertQuery: UserDiscordUpsertInput[] = [];
    const deleteQuery: string[] = [];

    for (const { id, refreshToken, updatedAt } of await this.state.database.userDiscord.findAll()) {
      if (Date.now() > updatedAt.getTime() + 6 * 24 * 60 * 60 * 1000) {
        const updatedData = await this.state.discord.oauth2.resetAccessToken(refreshToken);
        if (updatedData) {
          upsertQuery.push({
            id: id,
            refreshToken: updatedData.refreshToken,
            accessToken: updatedData.accessToken,
          });
        } else {
          deleteQuery.push(id);
        }
      }
    }

    await this.state.database.userDiscord.upsertAll(upsertQuery);
    await this.state.database.userDiscord.deleteAll(deleteQuery);
  }

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

    await this.state.database.userDiscord.upsert({
      id: user.id,
      accessToken,
      refreshToken,
      email: user.email,
    });

    const { id, email, username, avatarUrl, bannerUrl } = user;

    this.state.memory.userOAuth2.set(id, {
      email: email ?? undefined,
      username,
      avatarUrl: avatarUrl ?? undefined,
      bannerUrl: bannerUrl ?? undefined,
      updatedAt: new Date(),
    });

    return user;
  }

  public async getGuilds(userId: string): Promise<Guilds | null> {
    const cache = this.state.memory.oauth2Guilds.get(userId);
    if (cache) {
      return cache;
    }

    const token = await this.state.database.userDiscord.find(userId);
    if (!token) {
      return null;
    }

    const { accessToken } = token;
    const data = await this.state.discord.oauth2.fetchGuilds(accessToken);

    if (data) {
      const guilds = data.map(
        ({
          id,
          name,
          icon,
          banner,
          owner,
          approximate_member_count,
          approximate_presence_count,
        }) => ({
          id,
          name,
          icon,
          banner,
          owner,
          approximate_member_count,
          approximate_presence_count,
        }),
      );
      this.state.memory.oauth2Guilds.set(userId, guilds);
      return guilds;
    }

    return null;
  }
}

import type { UserDiscordUpsertInput } from "infra-database/types";
import type { Guilds } from "repo-memory/OAuth2Guilds";

import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Guild } from "./Guild";

export class OAuth2 extends Base {
  constructor(
    state: AppState,
    private readonly guild: Guild,
  ) {
    super(state);
  }

  public async updateTokens() {
    const upsertQuery: UserDiscordUpsertInput[] = [];
    const deleteQuery: string[] = [];

    for (const {
      userId,
      refreshToken,
      updatedAt,
    } of await this.state.database.userDiscord.findAll()) {
      if (Date.now() > updatedAt.getTime() + 6 * 24 * 60 * 60 * 1000) {
        const updatedData = await this.state.discord.oauth2.resetAccessToken(refreshToken);
        if (updatedData) {
          upsertQuery.push({
            userId,
            refreshToken: updatedData.refreshToken,
            accessToken: updatedData.accessToken,
          });
        } else {
          deleteQuery.push(userId);
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
      userId: user.id,
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

  public async getGuilds(userId: string, useCache: boolean = true): Promise<Guilds | null> {
    if (useCache) {
      const cache = this.state.memory.oauth2Guilds.get(userId);
      if (cache) {
        return cache;
      }
    }

    const token = await this.state.database.userDiscord.find(userId);
    if (!token) {
      return null;
    }

    const { accessToken } = token;
    const data = await this.state.discord.oauth2.fetchGuilds(accessToken);

    if (data) {
      const guilds = await Promise.all(
        data.map(
          async ({
            id,
            name,
            icon,
            banner,
            owner,
            approximate_member_count,
            approximate_presence_count,
          }) => {
            const isBotJoined = await this.guild.isBotJoined(id);
            const isPublic = await this.guild.isPublic(id);
            return {
              id,
              name,
              icon,
              banner,
              owner,
              approximate_member_count,
              approximate_presence_count,
              isBotJoined,
              isPublic,
            };
          },
        ),
      );
      this.state.memory.oauth2Guilds.set(userId, guilds);
      return guilds;
    }

    return null;
  }
}

import type { APIUser } from "discord-api-types/payloads/v10";
import type {
  RESTAPIPartialCurrentUserGuild,
  RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";
import type { Client, GuildFeature } from "discord.js";
import { safeFetch, safeUrl } from "infra-http";

import type { Config } from ".";
import { sleep } from "../sleep";
import { Base } from "./Base";

export type FetchUserInfoResult = {
  id: string;
  username: string;
  avatar: string | null;
  email?: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

export type FetchTokenResult = {
  accessToken: string;
  refreshToken: string;
};

export type Snowflake = string;

export type Permissions = string;

export type Guilds = {
  id: Snowflake;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  features: GuildFeature[];
  permissions: Permissions;
  approximate_member_count?: number;
  approximate_presence_count?: number;
}[];

export class OAuth2Controller extends Base {
  constructor(
    client: Client,
    protected readonly config: Config,
  ) {
    super(client);
  }

  public async fetchGuilds(accessToken: string): Promise<Guilds | null> {
    const response = await safeFetch(
      safeUrl`https://discord.com/api/v10/users/@me/guilds?with_counts=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (response.status === 200) {
      return (await response.json()) as RESTAPIPartialCurrentUserGuild[];
    } else if (response.status === 429) {
      await sleep(1000);
      return await this.fetchGuilds(accessToken);
    }

    return null;
  }

  public async fetchUserInfo(accessToken: string): Promise<FetchUserInfoResult | null> {
    const response = await safeFetch(safeUrl`https://discord.com/api/users/@me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) {
      const { id, username, email, avatar, banner } = (await response.json()) as APIUser;
      return {
        id,
        username,
        email,
        avatar,
        avatarUrl: avatar && this.client.rest.cdn.avatar(id, avatar),
        bannerUrl: (banner && this.client.rest.cdn.banner(id, banner)) ?? null,
      };
    } else if (response.status === 429) {
      await sleep(1000);
      return await this.fetchUserInfo(accessToken);
    }

    return null;
  }

  public async parseCode(code: string): Promise<FetchTokenResult | null> {
    const params = new URLSearchParams();
    params.append("client_id", this.config.id);
    params.append("client_secret", this.config.secret);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", encodeURI(this.config.url));
    params.append("code", code);

    const response = await safeFetch(safeUrl`https://discord.com/api/v10/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (response.status === 200) {
      const { access_token, refresh_token } =
        (await response.json()) as RESTPostOAuth2AccessTokenResult;
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    } else if (response.status === 429) {
      await sleep(1000);
      return await this.parseCode(code);
    } else {
      return null;
    }
  }

  public async resetAccessToken(refreshToken: string): Promise<FetchTokenResult | null> {
    const params = new URLSearchParams();
    params.append("client_id", this.config.id);
    params.append("client_secret", this.config.secret);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const response = await safeFetch(safeUrl`https://discord.com/api/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (response.status === 200) {
      const { access_token, refresh_token } =
        (await response.json()) as RESTPostOAuth2AccessTokenResult;
      return {
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    } else if (response.status === 429) {
      await sleep(1000);
      return await this.resetAccessToken(refreshToken);
    }

    return null;
  }

  public async joinGuild(
    userId: string,
    guildId: string,
    accessToken: string,
  ): Promise<"join" | "joined" | null> {
    const response = await safeFetch(
      safeUrl`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${this.config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      },
    );

    if (response.status === 429) {
      await sleep(1000);
      return await this.joinGuild(userId, guildId, accessToken);
    }

    return response.status === 201 ? "join" : response.status === 204 ? "joined" : null;
  }
}

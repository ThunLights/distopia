import {
  avatarUrl,
  bannerUrl,
  DiscordOAuth2,
  DiscordOAuth2Error,
  REST,
  type PartialGuild,
} from "discoauth";
import { safeFetchForDiscord, validateSafeUrl } from "infra-http";

import type { Config } from ".";

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

export type Guilds = PartialGuild[];

// Routes discoauth's requests through safeFetchForDiscord so they keep the Discord-domain
// allowlist and DNS pinning every other outbound call here gets.
export async function discordFetch(input: string, init: RequestInit): Promise<Response> {
  const url = validateSafeUrl(input);
  if (url === null) {
    throw new Error(`Invalid Discord API URL: ${input}`);
  }
  const response = await safeFetchForDiscord(url, init);
  if (response instanceof Error) {
    throw response;
  }
  return response;
}

async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  return await promise.catch(() => null);
}

const rest = new REST({ fetch: discordFetch });

// Standalone (needs no Config) so a process that never logs in to Discord, like
// presentation-verify, can still check guild membership from a user's OAuth2 access token.
export async function fetchOAuth2Guilds(accessToken: string): Promise<Guilds | null> {
  return await orNull(
    rest.request("get", "/users/@me/guilds", {
      auth: `Bearer ${accessToken}`,
      query: { with_counts: true },
    }) as Promise<Guilds>,
  );
}

export class OAuth2Controller {
  private readonly oauth: DiscordOAuth2;

  constructor(config: Config) {
    this.oauth = new DiscordOAuth2({
      clientId: config.id,
      clientSecret: config.secret,
      redirectUri: config.url,
      botToken: config.token,
      fetch: discordFetch,
    });
  }

  public async fetchGuilds(accessToken: string): Promise<Guilds | null> {
    return await fetchOAuth2Guilds(accessToken);
  }

  public async fetchUserInfo(accessToken: string): Promise<FetchUserInfoResult | null> {
    const user = await orNull(this.oauth.getUser(accessToken));
    if (!user) {
      return null;
    }
    const { id, username, email, avatar } = user;
    return {
      id,
      username,
      email,
      avatar: avatar ?? null,
      avatarUrl: avatarUrl(user),
      bannerUrl: bannerUrl(user),
    };
  }

  public async parseCode(code: string): Promise<FetchTokenResult | null> {
    const tokens = await orNull(this.oauth.exchangeCode(code));
    return tokens && { accessToken: tokens.access_token, refreshToken: tokens.refresh_token };
  }

  // null only for invalid_grant (HTTP 400, RFC 6749 §5.2) — callers delete the stored tokens on
  // null, so transient failures (network, 429, 5xx) must throw instead.
  public async resetAccessToken(refreshToken: string): Promise<FetchTokenResult | null> {
    const tokens = await this.oauth.refreshToken(refreshToken).catch((error: unknown) => {
      if (error instanceof DiscordOAuth2Error && error.status === 400) {
        return null;
      }
      throw error;
    });
    return tokens && { accessToken: tokens.access_token, refreshToken: tokens.refresh_token };
  }

  public async joinGuild(
    userId: string,
    guildId: string,
    accessToken: string,
  ): Promise<"join" | "joined" | null> {
    const result = await orNull(this.oauth.joinGuild(accessToken, guildId, userId));
    return result === "added" ? "join" : result === "already_member" ? "joined" : null;
  }
}

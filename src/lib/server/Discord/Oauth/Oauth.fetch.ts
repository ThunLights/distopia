import { errorHandling } from "$lib/server/error";

import { config } from "$lib/server/config";
import { database } from "$lib/server/Database/index";
import { discord } from "$lib/server/discord";
import { sleep } from "$lib/sleep";

import type { UserElement } from "$lib/server/Database/Database.user";

export type ResetAccessToken = {
    token_type: string
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
}

export type Options = {}

export class FetchError {
    constructor(public readonly content: string) {}
}

export class OauthFetch {
    public readonly config = config;

	public async resetAccessToken(refreshToken: string): Promise<ResetAccessToken | FetchError> {
        try {
            const params = new URLSearchParams();
            params.append("client_id", this.config.bot.id);
            params.append("client_secret", this.config.bot.secret);
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refreshToken);
            const response = await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
            });
            if (response.status === 200) {
                return await response.json();
            }
            if (response.status === 429) {
                await sleep(1000);
                return await this.resetAccessToken(refreshToken);
            }
            return new FetchError("HTTP_RESPONSE_ERROR");
        } catch (error) {
            errorHandling(error);
            return new FetchError("ERROR");
        }
    }

	private async fetchCore(url: string, options: RequestInit, user: UserElement): Promise<Response | FetchError> {
		try {
            const response = await fetch(url, options);
            if (response.status === 401) {
                const newAccessToken = await this.resetAccessToken(user.refreshToken);
                if (newAccessToken instanceof FetchError) {
					await database.token.delete(user.id);
                    return newAccessToken;
                }
                const data = await discord.oauth.code.getMoreInfo(newAccessToken.access_token);
                if (!data) {
					await database.token.delete(user.id);
                    return new FetchError("FETCH_USER_DATA_ERROR");
                }
                if (!await database.user.update(user.id, data.username, newAccessToken.access_token, newAccessToken.refresh_token)) {
					await database.token.delete(user.id);
                    return new FetchError("DATABASE_ERROR");
                }
				return await this.fetchCore(url, options, await database.user.data(user.id) ?? user);
            }
            if (response.status === 429) {
                await sleep(1000);
                return await this.useAccessToken(url, options, user);
            }
            return response;
        } catch (error) {
            errorHandling(error);
            return new FetchError("ERROR");
		}
	}

	public async useAccessTokenUltra(url: string, options: RequestInit, user: UserElement): Promise<Response | FetchError> {
		try {
            const response = await this.fetchCore(url, options, user);
			if (response instanceof FetchError) {
				return response;
			}
            return response;
        } catch (error) {
            errorHandling(error);
            return new FetchError("ERROR");
		}
	}

    public async useAccessToken<T>(url: string, options: RequestInit, user: UserElement): Promise<T | FetchError> {
        try {
            const response = await this.fetchCore(url, options, user);
			if (response instanceof FetchError) {
				return response;
			}
			if (response.ok) {
				const json: T = await response.json();
				return json;
			}

            return new FetchError("ERROR");
        } catch (error) {
            errorHandling(error);
            return new FetchError("ERROR");
        }
    }
}

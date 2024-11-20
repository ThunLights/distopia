import { errorHandling } from "./error";

import { config } from "./config";
import { database } from "./Database";

import type { BotConfig } from "./config";
import type { UserElement } from "./Database/Database.user";
import { discord } from "./discord";

export type ResetAccessToken = {
    token_type: string
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
}

export class FetchError {
    constructor(public readonly content: string) {}
}

export class OriginalFetch {
    constructor(
        private readonly config: BotConfig,
    ) {}

    private async resetAccessToken(refreshToken: string): Promise<ResetAccessToken | FetchError> {
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
                return await this.resetAccessToken(refreshToken);
            }
            return new FetchError("HTTP_RESPONSE_ERROR");
        } catch (error) {
            errorHandling(error);
            return new FetchError("ERROR");
        }
    }

    public async useAccessToken<T>(url: string, options: RequestInit, user: UserElement): Promise<T | FetchError> {
        try {
            const response = await fetch(url, options);
            if (response.status === 401) {
                const newAccessToken = await this.resetAccessToken(user.refreshToken);
                if (newAccessToken instanceof FetchError) {
                    return newAccessToken;
                }
                const data = await discord.getMoreInfo(newAccessToken.access_token);
                if (!data) {
                    return new FetchError("FETCH_USER_DATA_ERROR");
                }
                if (!await database.user.update(user.id, data.username, newAccessToken.access_token, newAccessToken.refresh_token)) {
                    return new FetchError("DATABASE_ERROR");
                }
            }
            if (response.status === 429) {
                return await this.useAccessToken(url, options, user);
            }
            if (response.ok) {
                return await response.json();
            }

            return new FetchError("");
        } catch (error) {
            errorHandling(error);
            return new FetchError("ERROR");
        }
    }
}

export const originalFetch = new OriginalFetch(config)

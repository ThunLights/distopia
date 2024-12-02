import { errorHandling } from "$lib/server/error";
import { FetchError } from "../Oauth.fetch";

import type { UserElement } from "$lib/server/Database/Database.user";
import type { OauthFetch } from "../Oauth.fetch";

export class GuildJoin {
    constructor (private readonly originalFetch: OauthFetch) {
    }

    public async fetch(guildId: string, userId: string, user: UserElement) {
		try {
			const response = await this.originalFetch.useAccessTokenUltra(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
				method: "PUT",
				headers: {
					Authorization: `Bot ${this.originalFetch.config.bot.token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					access_token: user.accessToken,
				}),
			}, user);
			if (response instanceof FetchError) {
				return null
			}
			return response;
		} catch (error) {
			errorHandling(error);
			return null;
		}
    }
}

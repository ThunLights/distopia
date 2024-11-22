import type { UserElement } from "$lib/server/Database/Database.user";
import type { GuildsUser } from "$lib/server/discord";
import { errorHandling } from "$lib/server/error";
import { FetchError } from "../Oauth.fetch";

import type { OauthFetch } from "../Oauth.fetch";

export class Guilds {
    constructor (private readonly originalFetch: OauthFetch) {
    }

    public async fetch(user: UserElement) {
        try {
            const response = await this.originalFetch.useAccessToken<Array<GuildsUser>>(
                "https://discord.com/api/v10/users/@me/guilds?with_counts=true",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                },
                user
            )
            if (response instanceof FetchError) {
                return null
            }
            return response
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }
}

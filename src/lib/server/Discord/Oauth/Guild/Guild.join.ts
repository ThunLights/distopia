import type { UserElement } from "$lib/server/Database/Database.user";
import type { OauthFetch } from "../Oauth.fetch";

export class GuildJoin {
    constructor (private readonly originalFetch: OauthFetch) {
    }

    public async fetch(guildId: string, userId: string, user: UserElement) {
        const response = await this.originalFetch.useAccessToken(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            method: "POST",
        }, user)
        console.log(response);
    }
}

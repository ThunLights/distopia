import { errorHandling } from "$lib/server/error";
import { BOT_TOKEN } from "$env/static/private";

import type { UserElement } from "$lib/server/Database/Database.user";

export class GuildJoin {
    public async exec(guildId: string, userId: string, user: UserElement) {
		try {
			const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
				method: "PUT",
				headers: {
					Authorization: `Bot ${BOT_TOKEN}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					access_token: user.accessToken,
				}),
			});
			return response;
		} catch (error) {
			errorHandling(error);
			return null;
		}
    }
}

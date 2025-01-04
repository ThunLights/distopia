import { errorHandling } from "$lib/server/error";
import { discord } from "$lib/server/discord";
import { database } from "$lib/server/Database/index";
import { FetchError } from "$lib/server/Discord/Oauth/Oauth.fetch";

import type { HandleServerError } from "@sveltejs/kit"

async function start() {
	await discord.bot.setEvents();
	await discord.bot.login();

	setTimeout(async () => {
		const users = await database.user.aboutExpire();
		for (const user of users) {
			const newData = await discord.oauth.fetch.resetAccessToken(user.refreshToken);
			if (newData instanceof FetchError) {
				await database.user.delete(user.id);
				await database.token.delete(user.id);
			} else {
				await database.user.update(user.id, user.username, newData.access_token, newData.refresh_token);
			}
		}
	}, 5 * 60 * 1000);
}

export const handleError = (async (input) => {
    if (input.status === 404) {
        return;
    };
	if (input.status === 405) {
		return;
	};
	errorHandling(input);
}) satisfies HandleServerError;

await start();

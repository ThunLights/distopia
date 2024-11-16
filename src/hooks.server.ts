import { errorHandling } from "$lib/server/error";
import { discord } from "$lib/server/discord";

import type { HandleServerError } from "@sveltejs/kit"

async function start() {
	await discord.bot.setEvents();
	await discord.bot.login();
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

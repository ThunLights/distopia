import { errorHandling } from "$lib/error";
import { discord } from "$lib/discord";

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

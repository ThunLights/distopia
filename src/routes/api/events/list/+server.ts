import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { json } from "@sveltejs/kit";
import { generateErrorJson } from "$lib/server/json";
import { database } from "$lib/server/Database/index";
import { discord } from "$lib/server/discord";
import { structChecker } from "$lib/struct";
import { z } from "zod";

import type { RequestHandler } from "@sveltejs/kit";

export type ResponseJson = {
	post: {
		content: {
			eventId: string
			name: string
			description: string
		}[]
	}
}

export const _BodyZod = z.object({
    guildId: z.string(),
});

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _BodyZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}

	const owner = await discord.bot.control.guild.fetchOwner(body.guildId);
	if (!(
		(owner && owner === auth.data.id)
		|| (await discord.bot.control.guild.isAdmin(body.guildId, auth.data.id))
	)) {
		return generateErrorJson("PERMISSION_DENIED");
	}

    const elements = await discord.bot.control.guild.fetchEvents(body.guildId);

	return json({
		content: elements.map(event => {return {
			eventId: event.id,
			name: event.name,
			description: event.description ?? "",
		}}),
	} satisfies ResponseJson["post"], { status: 200 });
}) satisfies RequestHandler;

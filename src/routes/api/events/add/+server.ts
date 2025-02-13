import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { json } from "@sveltejs/kit";
import { generateErrorJson } from "$lib/server/json";
import { z } from "zod";
import { structChecker } from "$lib/struct";
import { discord } from "$lib/server/discord";
import { database } from "$lib/server/Database/index";

import type { RequestHandler } from "@sveltejs/kit";

export const _Body = {
	post: z.object({
		guildId: z.string(),
		eventId: z.string(),
	}),
}

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _Body.post);

	if (auth instanceof ServerError) {
		return generateErrorJson("AUTHORIZATION_ERROR");
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

	const event = await discord.bot.control.guild.fetchEvent(body.guildId, body.eventId);
	if (!event) {
		return generateErrorJson("EVENT_NOT_FOUND");
	}

	if (await database.eventBoost.fetch(body.guildId)) {
		return generateErrorJson("ALREADY_ADDED");
	}

	if (await database.eventBoost.latelimit.fetch(body.guildId)) {
		return generateErrorJson("LATELIMIT");
	}

	const result = await database.eventBoost.update(body.guildId, body.eventId);
	await database.eventBoost.latelimit.update(body.guildId);

	if (!result) {
		return generateErrorJson("DATABASE_ERROR");
	}

	return json({
		content: "success",
	}, { status: 200 });
}) satisfies RequestHandler;

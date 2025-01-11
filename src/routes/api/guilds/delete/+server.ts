import { json } from "@sveltejs/kit";
import { z } from "zod";

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { generateErrorJson } from "$lib/server/json";
import { structChecker } from "$lib/struct";
import { database, DatabaseError } from "$lib/server/Database";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "@sveltejs/kit";

export const _RequestZod = z.object({
	guildId: z.string(),
});

export type Request = z.infer<typeof _RequestZod>;

export const DELETE = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	const guild = await database.guildTables.guild.id2Data(body.guildId);
	const ownerId = await discord.bot.control.guild.fetchOwner(body.guildId);
	if (guild === null || guild instanceof DatabaseError) {
		return generateErrorJson("SERVER_NOT_FOUND");
	}
	if (ownerId !== auth.data.id) {
		return generateErrorJson("SERVER_OWNER_ERROR");
	}
	const { guildId } = guild;
	const result = await database.guildTables.guild.delete(guildId);
	if (!result) {
		return generateErrorJson("DATABASE_ERROR");
	}
	await database.guildTables.guild.delete(guildId);
	await database.guildTables.level.delete(guildId);
	await database.guildTables.bump.delete(guildId);
	await database.guildTables.tag.delete(guildId);
	await database.guildTables.nsfw.delete(guildId);
	await database.guildTables.review.delete.guilds(guildId);
	return json({}, { status: 200 });
}) satisfies RequestHandler;

import { json } from "@sveltejs/kit";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { database, DatabaseError } from "$lib/server/Database/index";
import { generateErrorJson } from "$lib/server/json";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "@sveltejs/kit";

export type Response = {
	guildId: string;
	userId: string;
	name: string;
	invite: string;
	icon: string | null;
	banner: string | null;
	category: string;
	description: string;
	tags: string[];
	nsfw: boolean;
}

export const POST = (async (e) => {
	const guildId = e.params.id;
	const auth = await authorization(e);
	if (!guildId) {
		return generateErrorJson("ID_NOT_FOUND");
	}
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTHORIZATION_ERROR");
	}
	const guild = await database.guildTables.guild.id2Data(guildId);
	const tags = await database.guildTables.tag.data(guildId);
	const nsfw = await database.guildTables.nsfw.data(guildId);
	if (guild instanceof DatabaseError || guild === null) {
		return generateErrorJson("SERVER_NOT_FOUND");
	}
	return json({...guild, ...{ nsfw, tags, members: await discord.bot.control.guild.memberCount(guildId), online: await discord.bot.control.guild.memberCount(guildId, "online") }} satisfies Response, { status: 200 })
}) satisfies RequestHandler;

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { database, DatabaseError } from "$lib/server/Database";
import { json } from "@sveltejs/kit";

import type { RequestHandler } from "@sveltejs/kit";
import { generateErrorJson } from "$project/src/lib/server/json";

export type Response = {
	content: {
		guildId: string;
		userId: string;
		name: string;
		invite: string;
		icon: string | null;
		banner: string | null;
		category: string;
		description: string;
	}
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
	if (guild instanceof DatabaseError || guild === null) {
		return generateErrorJson("SERVER_NOT_FOUND");
	}
	return json({
		content: guild,
	} satisfies Response, { status: 200 })
}) satisfies RequestHandler;

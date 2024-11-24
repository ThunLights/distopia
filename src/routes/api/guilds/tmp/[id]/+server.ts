import { json } from "@sveltejs/kit";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { database } from "$project/src/lib/server/Database/index";

import type { RequestHandler } from "@sveltejs/kit";

export type Response = {
	content: {
		guildId: string;
		userId: string;
		name: string;
		invite: string;
		icon: string | null;
		banner: string | null;
	}
}

export const POST = (async (e) => {
	const guildId = e.params.id;
	const auth = await authorization(e);
	if (!guildId) {
		return json({
			content: "ID_NOT_FOUND",
		}, { status: 400 });
	}
	if (auth instanceof ServerError) {
		return json({
			content: "AUTHORIZATION_ERROR"
		}, { status: 400 });
	}
	const guild = await database.guildTables.tmp.data(guildId);
	if (!guild) {
		return json({
			content: "SERVER_NOT_FOUND",
		}, { status: 400 });
	}
	return json({
		content: guild,
	} satisfies Response, { status: 200 })
}) satisfies RequestHandler;

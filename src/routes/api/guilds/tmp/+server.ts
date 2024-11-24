import { authorization } from "$lib/server/auth";
import { database } from "$lib/server/Database";
import { ServerError } from "$lib/server/error";
import { json } from "@sveltejs/kit";

import type { RequestHandler } from "@sveltejs/kit";

export type Response = {
	content: {
		guildId: string;
		userId: string;
		name: string;
		invite: string;
		icon: string | null;
		banner: string | null;
	}[]
}

export const POST = (async (e) => {
	const auth = await authorization(e);
	if (auth instanceof ServerError) {
		return json({
			content: "AUTHORIZATION_ERROR"
		}, { status: 400 });
	}
	const guilds = await database.guildTables.tmp.datas(auth.data.id);
	return json({
		content: guilds,
	} satisfies Response, { status: 200 });
}) satisfies RequestHandler;

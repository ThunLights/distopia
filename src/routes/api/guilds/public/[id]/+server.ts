import { json } from "@sveltejs/kit";
import { generateErrorJson } from "$lib/server/json";
import { id2Guild } from "$lib/server/guild";

import type { RequestHandler } from "@sveltejs/kit";
import type { Guild } from "$lib/server/guild";

export type Response = Guild;

export const POST = (async (e) => {
	const guildId = e.params.id;
	if (!guildId) {
		return generateErrorJson("ID_NOT_FOUND");
	}
	const content = await id2Guild(guildId);
	if (typeof content === "string") {
		return generateErrorJson(content);
	}
	return json(content, { status: 200 });
}) satisfies RequestHandler;

import { json } from "@sveltejs/kit";

import { database } from "$lib/server/Database/index";

import type { RequestHandler } from "@sveltejs/kit";
import type { LevelObj } from "$lib/server/Database/Guild/Guild.level";

export type Response = {
	level: LevelObj[]
}

export const POST = (async (e) => {
	const level = await database.guildTables.level.ranking(40);
	return json({
		level,
	} satisfies Response, { status: 200 });
}) satisfies RequestHandler;

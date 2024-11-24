import { database, DatabaseError } from "$lib/server/Database";
import { structChecker } from "$lib/struct";
import { json } from "@sveltejs/kit";
import { z } from "zod";

import type { RequestHandler } from "@sveltejs/kit";
import type { Guild } from "$lib/server/Database/Guild/Guild";

export const _RequestZod = z.object({
	take: z.number().min(1).max(50),
});

export type Request = z.infer<typeof _RequestZod>;

export type Response = {
	content: Guild[]
};

export const POST = (async (e) => {
	const body = structChecker(await e.request.json(), _RequestZod);
	if (!body) {
		return json({
			content: "BODY_ERROR",
		}, { status: 400 });
	}
	const guilds: Guild[] = [];
	const bumpGuilds = await database.guildTables.bump.guilds(body.take);
	for (const bumpGuild of bumpGuilds) {
		const guild = await database.guildTables.guild.id2Data(bumpGuild);
		if (guild === null || guild instanceof DatabaseError) {
			continue;
		}
		guilds.push(guild);
	}
	return json({
		content: guilds,
	} satisfies Response, { status: 200 });
}) satisfies RequestHandler;

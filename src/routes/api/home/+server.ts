import { database } from "$lib/server/Database";
import { structChecker } from "$lib/struct";
import { generateErrorJson } from "$lib/server/json";
import { id2Guild } from "$lib/server/guild";
import { json } from "@sveltejs/kit";
import { z } from "zod";

import type { RequestHandler } from "@sveltejs/kit";
import type { Guild } from "$lib/server/guild";
import { errorHandling } from "$project/src/lib/server/error";

export const _RequestZod = z.object({
	take: z.number().min(1).max(50),
});

export type Request = z.infer<typeof _RequestZod>;

export type Response = {
	content: Guild[]
	active: Guild[]
};

async function getActiveGuilds() {
	try {
		const guilds: Guild[] = [];
		const guildsBase = await database.guildTables.activeRate.ranking(20);
		for (const guildBase of guildsBase) {
			const guild = await id2Guild(guildBase.guildId);
			if (typeof guild === "string") {
				continue;
			}
			guilds.push(guild);
		}
		return guilds
	} catch (error) {
		errorHandling(error);
		return [];
	}
}

export const POST = (async (e) => {
	const body = structChecker(await e.request.json(), _RequestZod);
	if (!body) {
		return generateErrorJson("BODY_ERROR");
	}
	const guilds: Guild[] = [];
	const bumpGuilds = await database.guildTables.bump.guilds(body.take);
	for (const bumpGuild of bumpGuilds) {
		const guild = await id2Guild(bumpGuild);
		if (typeof guild === "string") {
			continue;
		}
		guilds.push(guild);
	}
	return json({
		content: guilds,
		active: await getActiveGuilds(),
	} satisfies Response, { status: 200 });
}) satisfies RequestHandler;

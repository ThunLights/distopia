import { json } from "@sveltejs/kit";
import { z } from "zod";
import { structChecker } from "$lib/struct";
import { generateErrorJson } from "$lib/server/json";
import { blank } from "$lib/blank.svelte";
import { deDepulicationObject } from "$lib/array";
import { errorHandling } from "$lib/server/error";
import { database } from "$lib/server/Database";
import { id2Guild } from "$lib/server/guild";

import type { RequestHandler } from "@sveltejs/kit";
import type { Guild } from "$lib/server/guild";

export const _RequestZod = z.object({
	content: z.string(),
})

export type Request = z.infer<typeof _RequestZod>;

export type Response = {
	guilds: Guild[]
};

async function searchName(names: string[]) {
	try {
		const guilds: Guild[] = [];
		for (const name of names) {
			for (const guild of await database.guildTables.guild.findName(name)) {
				const data = await id2Guild(guild.guildId);
				if (typeof data === "string") continue;
				guilds.push(data);
			}
		}
		return guilds;
	} catch (error) {
		errorHandling(error);
		return []
	}
}

async function searchTag(names: string[]) {
	try {
		const guilds: Guild[] = [];
		for (const name of names) {
			for (const guild of await database.guildTables.tag.findTag(name)) {
				const data = await id2Guild(guild.guildId);
				if (typeof data === "string") continue;
				guilds.push(data);
			}
		}
		return guilds;
	} catch (error) {
		errorHandling(error);
		return []
	}
}

export const POST = (async (e) => {
	const body = structChecker(await e.request.json(), _RequestZod);
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	if (blank(body.content)) {
		return generateErrorJson("BODY_CONTENT_ERROR");
	}
	const words = body.content.split(/\s+/g);
	const nameElement = await searchName(words);
	const tagElement = await searchTag(words);
	const guilds = deDepulicationObject(nameElement.concat(tagElement));
	return json({
		guilds,
	} satisfies Response, { status: 200 });
}) satisfies RequestHandler;

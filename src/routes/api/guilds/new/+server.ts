import { json } from "@sveltejs/kit";
import { z } from "zod";
import { structChecker } from "$lib/struct";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { database, DatabaseError } from "$lib/server/Database";
import { foundCategory } from "$lib/category.svelte";
import { descriptionFormatCheck } from "$lib/description.svelte";
import { tagCountCheck, tagFormatCheck } from "$lib/tag.svelte";
import { generateErrorJson } from "$lib/server/json";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "@sveltejs/kit";

export const _RequestZod = z.object({
	guildId: z.string(),
	nsfw: z.boolean(),
	tags: z.string().array(),
	category: z.string(),
	description: z.string(),
});

export type Request = z.infer<typeof _RequestZod>;

async function invalidElementCheck(body: Request) {
	if (!foundCategory(body.category)) {
		return generateErrorJson("CATEGORY_NOT_FOUND");
	}
	if (!descriptionFormatCheck(body.description)) {
		return generateErrorJson("DESCRIPTION_CHARACTER_LIMIT_ERROR");
	}
	if (!tagCountCheck(body.tags)) {
		return generateErrorJson("TAG_LIMIT_ERROR");
	}
	for (const tag of body.tags) {
		if (!tagFormatCheck(tag)) {
			return generateErrorJson("TAG_CHARACTER_LIMIT_ERROR");
		}
	}
	return null;
}

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	const guildTmp = await database.guildTables.tmp.data(body.guildId);
	const ownerId = await discord.bot.control.guild.owner(body.guildId);
	if (!guildTmp) {
		return generateErrorJson("TMP_NOT_FOUND");
	}
	if (ownerId !== auth.data.id) {
		return generateErrorJson("THIS_GUILD_IS_NOT_YOURS");
	}
	const checkedBody = await invalidElementCheck(body);
	if (checkedBody) {
		return checkedBody;
	}
	const result = await database.guildTables.guild.update({
		...guildTmp,
		...{
			category: body.category,
			description: body.description.trim(),
		}
	});
	if (!result) {
		return generateErrorJson("DATABASE_ERROR");
	}
	await database.guildTables.bump.update(guildTmp.guildId);
	await database.guildTables.nsfw.update(guildTmp.guildId, body.nsfw);
	await database.guildTables.tag.update(guildTmp.guildId, body.tags);
	await database.guildTables.tmp.delete(guildTmp.guildId);
	return json({
		content: "SUCCESS"
	}, { status: 200 });
}) satisfies RequestHandler;

export const PATCH = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	const checkedBody = await invalidElementCheck(body);
	if (checkedBody) {
		return checkedBody;
	}
	const guild = await database.guildTables.guild.id2Data(body.guildId);
	if (guild instanceof DatabaseError || guild === null) {
		return generateErrorJson("GUILD_NOT_FOUND");
	}
	const result = await database.guildTables.guild.update({...guild, ...{ category: body.category, description: body.description.trim() }});
	if (!result) {
		return generateErrorJson("DATABASE_ERROR");
	}
	await database.guildTables.nsfw.update(guild.guildId, body.nsfw);
	await database.guildTables.tag.update(guild.guildId, body.tags);
	return json({
		content: "SUCCESS"
	}, { status: 200 });
}) satisfies RequestHandler;

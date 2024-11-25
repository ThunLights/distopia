import { json } from "@sveltejs/kit";
import { z } from "zod";
import { structChecker } from "$lib/struct";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { database } from "$lib/server/Database";
import { foundCategory } from "$lib/category.svelte";
import { descriptionFormatCheck } from "$lib/description.svelte";
import { tagCountCheck, tagFormatCheck } from "$lib/tag.svelte";

import type { RequestHandler } from "@sveltejs/kit";

export const _RequestZod = z.object({
	guildId: z.string(),
	nsfw: z.boolean(),
	tags: z.string().array(),
	category: z.string(),
	description: z.string(),
});

export type Request = z.infer<typeof _RequestZod>;

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return json({
			content: "AUTH_ERROR",
		}, { status: 400 });
	}
	if (!body) {
		return json({
			content: "BODY_FORMAT_ERROR",
		}, { status: 400 });
	}
	const guildTmp = await database.guildTables.tmp.data(body.guildId);
	if (!guildTmp) {
		return json({
			content: "TMP_NOT_FOUND",
		}, { status: 400 });
	}
	if (guildTmp.userId !== auth.data.id) {
		return json({
			content: "THIS_GUILD_IS_NOT_YOURS",
		}, { status: 400 });
	}
	if (!foundCategory(body.category)) {
		return json({
			content: "CATEGORY_NOT_FOUND",
		}, { status: 400 });
	}
	if (!descriptionFormatCheck(body.description)) {
		return json({
			content: "DESCRIPTION_CHARACTER_LIMIT_ERROR",
		}, { status: 400 });
	}
	if (!tagCountCheck(body.tags)) {
		return json({
			content: "TAG_LIMIT_ERROR",
		}, { status: 400 });
	}
	for (const tag of body.tags) {
		if (!tagFormatCheck(tag)) {
			return json({
				content: "TAG_CHARACTER_LIMIT_ERROR",
			}, { status: 400 });
		}
	}
	const result = await database.guildTables.guild.update({
		...guildTmp,
		...{
			category: body.category,
			description: body.description,
		}
	});
	if (!result) {
		return json({
			content: "DATABASE_ERROR",
		}, { status: 400 });
	}
	await database.guildTables.bump.update(guildTmp.guildId);
	await database.guildTables.nsfw.update(guildTmp.guildId, body.nsfw);
	await database.guildTables.tag.update(guildTmp.guildId, body.tags);
	await database.guildTables.tmp.delete(guildTmp.guildId);
	return json({
		content: "SUCCESS"
	}, { status: 200 });
}) satisfies RequestHandler;

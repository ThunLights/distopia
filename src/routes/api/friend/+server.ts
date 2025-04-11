import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { generateErrorJson } from "$lib/server/json";
import { structChecker } from "$lib/struct";
import { json } from "@sveltejs/kit";
import { z } from "zod";
import { database } from "$lib/server/Database/index";
import { dedepulication } from "$lib/array";
import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "$lib/constants";

import type { RequestHandler } from "@sveltejs/kit";

export const _RequestZod = z.object({
	description: z.string().max(CHARACTER_LIMIT.description),
	nsfw: z.boolean(),
	tags: z.string().max(CHARACTER_LIMIT.tag).array().max(TAG_COUNT_LIMIT)
});

export type Request = z.infer<typeof _RequestZod>;

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	await database.friend.tag.delete(auth.content.id);
	await database.friend.update({
		userId: auth.content.id,
		username: auth.content.username,
		description: body.description,
		time: new Date(),
		nsfw: body.nsfw
	});
	for (const tag of dedepulication(body.tags)) {
		await database.friend.tag.update(auth.content.id, tag);
	}
	return json({}, { status: 200 });
}) satisfies RequestHandler;

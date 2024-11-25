import { z } from "zod";
import { json } from "@sveltejs/kit";
import { structChecker } from "$lib/struct";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { generateErrorJson } from "$lib/server/json";
import { database } from "$lib/server/Database";

import type { RequestHandler } from "@sveltejs/kit";

export const _RequestZod = z.object({
	guildId: z.string(),
	star: z.number().min(0).max(5),
	content: z.string().optional(),
});

export type Request = z.infer<typeof _RequestZod>;

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTHORIZATION_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	const result = await database.guildTables.review.update({...body, ...{ userId: auth.data.id }});
	if (!result) {
		return generateErrorJson("DATABASE_ERROR");
	}
	return json({
		content: "SUCCESS",
	}, { status: 200 });
}) satisfies RequestHandler;

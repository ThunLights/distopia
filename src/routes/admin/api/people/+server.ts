import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { json } from "@sveltejs/kit";
import { z } from "zod";
import { generateErrorJson } from "$lib/server/json";
import { PUBLIC_OWNER_ID } from "$env/static/public";
import { structChecker } from "$lib/struct";
import { database } from "$lib/server/Database/index";
import { DangerousPeopleTypeZod } from "$lib/constants";

import type { RequestHandler } from "@sveltejs/kit";

export const _BodyZod = z.object({
	userId: z.string(),
	name: z.string(),

	type: DangerousPeopleTypeZod,

	title: z.string(),
	description: z.string(),

	score: z.string().array(),
	tags: z.string().array(),
});

export type Body = z.infer<typeof _BodyZod>;

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _BodyZod);

	if (auth instanceof ServerError) {
		return generateErrorJson("AUTHORIZATION_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}

	if (auth.data.id === PUBLIC_OWNER_ID) {
		const result = await database.dangerousPeople.update(body.userId, {
			...body,
			...{
				score: undefined,
				tags: undefined,
				userId: undefined,
				time: new Date(),
			}
		});
		if (!result) {
			return generateErrorJson("DATABASE_ERROR");
		}
		for (const score of body.score) {
			await database.dangerousPeople.score.update(body.userId, score);
		}
		for (const tag of body.tags) {
			await database.dangerousPeople.tag.update(body.userId, tag);
		}

		return json({
			content: "success"
		}, { status: 200 });
	}

	return generateErrorJson("PERMISSION_DENIED");
}) satisfies RequestHandler;

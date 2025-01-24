import { json } from "@sveltejs/kit";
import { z } from "zod";
import { structChecker } from "$lib/struct";
import { generateErrorJson } from "$lib/server/json";
import { database } from "$lib/server/Database/index";

import type { RequestHandler } from "@sveltejs/kit";

const bodyZod = z.object({
	userId: z.string(),
});

export type ResponseJson = {
	userId: string
	user: {
		userId: string
		type: string
		name: string
		title: string
		description: string
		time: Date
	}
	score: string[]
	tags: string[]
}

export const POST = (async (e) => {
	const body = structChecker(await e.request.json(), bodyZod);

	if (!body) {
		return generateErrorJson("BODY_ERROR");
	}

	const { userId } = body;
	const user = await database.dangerousPeople.fetch(userId);
	if (!user) {
		return generateErrorJson("USER_NOT_FOUND", 404);
	}

	return json({
		userId,
		user,
		score: await database.dangerousPeople.score.fetch(userId),
		tags: (await database.dangerousPeople.tag.findUserTags(userId)).map(value => value.content),
	} satisfies ResponseJson, { status: 200 });
}) satisfies RequestHandler;

import { json } from "@sveltejs/kit";
import { z } from "zod";

import { authorization } from "$lib/server/auth";
import { generateErrorJson } from "$lib/server/json";
import { database } from "$lib/server/Database/index";
import { structChecker } from "$lib/struct";
import { ServerError } from "$lib/server/error";

import type { RequestHandler } from "@sveltejs/kit";

export const _RequestZod = z.object({});

export type Request = z.infer<typeof _RequestZod>;

export const DELETE = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	const result = await database.token.delete(auth.data.id);
	if (!result) {
		return generateErrorJson("DATABASE_ERROR");
	}
	return json(
		{
			content: "SUCCESS"
		},
		{ status: 200 }
	);
}) satisfies RequestHandler;

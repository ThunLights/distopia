import { json } from "@sveltejs/kit";
import { z } from "zod";

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";

import type { RequestHandler } from "@sveltejs/kit";

export const _ResponseContentZod = z.object({
	token: z.string(),
	id: z.string(),
	username: z.string(),
	email: z.string().nullable(),
	avatar: z.string().nullable()
});
export const _ResponseZod = z.object({
	content: z.string().or(_ResponseContentZod)
});

export type ResponseContent = z.infer<typeof _ResponseContentZod>;
export type ResponseJson = z.infer<typeof _ResponseZod>;

export const POST = (async (e) => {
	const user = await authorization(e);
	if (user instanceof ServerError) {
		return json(
			{
				content: user.content
			},
			{ status: 400 }
		);
	}
	const response = {
		content: user.content
	} satisfies ResponseJson;
	return json(response, { status: 200 });
}) satisfies RequestHandler;

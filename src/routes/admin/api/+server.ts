import { PUBLIC_OWNER_ID } from "$env/static/public";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { json } from "@sveltejs/kit";

import type { RequestHandler } from "@sveltejs/kit";

export const POST = (async (e) => {
	const auth = await authorization(e);

	if (auth instanceof ServerError) {
		return json(
			{
				content: "fuck"
			},
			{ status: 400 }
		);
	}

	if (auth.data.id === PUBLIC_OWNER_ID) {
		return json(
			{
				content: "success"
			},
			{ status: 200 }
		);
	}

	return json(
		{
			content: "fuck"
		},
		{ status: 400 }
	);
}) satisfies RequestHandler;

import { json } from "@sveltejs/kit";

import type { RequestHandler } from "@sveltejs/kit";

export const POST = (async () => {
	return json({
		content: "comming soon"
	})
}) satisfies RequestHandler;

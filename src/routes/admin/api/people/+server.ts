import { json } from "@sveltejs/kit";

import type { RequestHandler } from "@sveltejs/kit";

export const POST = (async () => {
	return json({}, { status: 200 });
}) satisfies RequestHandler;

export const DELETE = (async ()=> {
	return json({}, { status: 200 });
}) satisfies RequestHandler;

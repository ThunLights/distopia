import { json } from "@sveltejs/kit";

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";

import type { RequestHandler } from "@sveltejs/kit";
import type { Response } from "$lib/types/auth/index";

export const POST = (async (e) => {
    const user = await authorization(e);
    if (user instanceof ServerError) {
        return json({}, { status: 400 })
    }
    const response = {
        content: user.content,
    } satisfies Response;
    return json(response)
}) satisfies RequestHandler;

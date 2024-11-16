import { json } from "@sveltejs/kit";
import { z } from "zod";

import { structChecker } from "$lib/struct";
import { authorization } from "$lib/auth";
import { ServerError } from "$lib/error";
import { database } from "$lib/Database";

import type { RequestHandler } from "@sveltejs/kit";

export const _ResponseZod = z.object({
    content: z.string().or(z.object({
        id: z.string(),
        username: z.string(),
        email: z.string().nullable(),
        avatar: z.string().nullable(),
    }))
});

export type Response = z.infer<typeof _ResponseZod>;

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

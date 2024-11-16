import { json } from "@sveltejs/kit";

import { structChecker } from "$lib/struct";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { discord } from "$lib/server/discord";
import { _RequestZod } from "$lib/api/guilds/index";

import type { RequestHandler } from "@sveltejs/kit";
import type { Response } from "$lib/api/guilds/index";

export const POST = (async (e) => {
    const body = structChecker(e.request.body, _RequestZod);
    const user = await authorization(e);
    if (!body) {
        return json({
            content: "BODY_PARSE_ERROR"
        } satisfies Response, { status: 400 })
    }
    if (user instanceof ServerError) {
        return json({
            content: user.content,
        } satisfies Response, { status: 400 });
    }
    await discord.guilds(user.data.accessToken);
    const response = {
        content: {}
    } satisfies Response;
    return json(response);
}) satisfies RequestHandler;

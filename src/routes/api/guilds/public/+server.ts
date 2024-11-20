import { json } from "@sveltejs/kit";

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { database, DatabaseError } from "$lib/server/Database/index";

import type { RequestHandler } from "@sveltejs/kit";
import type { Response } from "$lib/types/guilds/public/index";

export const POST = (async (e) => {
    const user = await authorization(e);
    if (user instanceof ServerError) {
        return json({
            content: user.content,
        } satisfies Response, { status: 400 })
    }
    const guilds = await database.guildTables.guild.userGuilds(user.data);
    if (guilds instanceof DatabaseError) {
        return json({
            content: guilds.content,
        } satisfies Response, { status: 400 })
    }
    return json({
        content: guilds,
    } satisfies Response, { status: 200 })
}) satisfies RequestHandler;

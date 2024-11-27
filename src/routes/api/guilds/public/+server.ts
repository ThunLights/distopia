import { json } from "@sveltejs/kit";

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { database, DatabaseError } from "$lib/server/Database/index";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "@sveltejs/kit";

export type SuccessResponse = {
	name: string
	icon: string | null
	banner: string | null
	invite: string
	guildId: string
	userId: string
	category: string
	description: string
	members: number | null
	online: number | null
}

export type Response = {
    content: string | SuccessResponse[];
}

export const POST = (async (e) => {
    const user = await authorization(e);
    if (user instanceof ServerError) {
        return json({
            content: user.content,
        } satisfies Response, { status: 400 })
    }
	const result = [];
    const guilds = await database.guildTables.guild.userGuilds(user.data);
    if (guilds instanceof DatabaseError) {
        return json({
            content: guilds.content,
        } satisfies Response, { status: 400 })
    }
	for (const guild of guilds) {
		result.push({
			...guild,
			...{ members: await discord.bot.control.guild.memberCount(guild.guildId), online: await discord.bot.control.guild.memberCount(guild.guildId, "online")}
		})
	}
    return json({
        content: result,
    } satisfies Response, { status: 200 })
}) satisfies RequestHandler;

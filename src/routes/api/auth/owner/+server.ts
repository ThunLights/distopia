import { json } from "@sveltejs/kit";

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { generateErrorJson } from "$lib/server/json";
import { cache } from "$lib/server/Cache";
import { discord } from "$lib/server/discord";
import { database, DatabaseError } from "$lib/server/Database/index";

import type { RequestHandler } from "@sveltejs/kit";
import type { UserElement } from "$lib/server/Database/Database.user";
import type { Guild } from "$lib/server/Database/Guild/Guild";

export type Response = {
    joinBot: boolean;
    tmp: boolean;
	guild: Guild | null;
    id: string;
    name: string;
    owner: boolean;
    permissions: string;
    approximate_member_count: number;
    approximate_presence_count: number;
    icon?: string | undefined;
    banner?: string | undefined;
}[]

async function getGuilds(user: UserElement) {
	const guildsCache = await cache.discord.guilds.checkCache(user.id);
	if (guildsCache) {
		return guildsCache;
	}
	const data = await discord.oauth.guild.guilds.exec(user);
	if (data) {
		await cache.discord.guilds.insert(user.id, data);
	}
	return data;
}

export const POST = (async (e) => {
    const user = await authorization(e);
    if (user instanceof ServerError) {
        return generateErrorJson(user.content);
    }
    const guilds = await getGuilds(user.data);
    const tmpGuilds = await database.guildTables.tmp.datas();
    if (!guilds) {
        return generateErrorJson("GUILDS_NOT_FOUND");
    }
    const response: Response = [];
	for (const guild of guilds) {
		const actingOwner = await database.guildTables.settings.owner.fetch(guild.id);
		if (guild.owner || (actingOwner && actingOwner.userId === user.data.id) || await discord.bot.control.guild.isAdmin(guild.id, user.data.id)) {
			const official = await database.guildTables.guild.id2Data(guild.id);
			response.push({...guild, ...{
				guild: official instanceof DatabaseError ? null : official,
				joinBot: await discord.bot.control.guild.isJoined(guild.id),
				tmp: tmpGuilds.map(value => value.guildId).includes(guild.id),
			}});
		}
	}
    return json(response);
}) satisfies RequestHandler;

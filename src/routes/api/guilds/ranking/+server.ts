import { json } from "@sveltejs/kit";
import { database } from "$lib/server/Database/index";
import { id2Guild } from "$lib/server/guild";
import { cache } from "$lib/server/Cache/index";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "./$types";
import type { User } from "$lib/server/Cache/Discord/Discord.users";
import type { Guild } from "$lib/server/guild";

export type ResponseJson = {
	post: {
		level: Guild[];
		activeRate: Guild[];
		users: (User & {
			count: number;
		})[];
	};
};

export const POST = (async () => {
	const levelBase = await database.guildTables.level.ranking(50);
	const activeRateBase = await database.guildTables.activeRate.ranking(50);

	const users: (User & { count: number })[] = [];
	const level: Guild[] = [];
	const activeRate: Guild[] = [];

	for (const element of levelBase) {
		const data = await id2Guild(element.guildId);
		if (typeof data === "string") continue;
		level.push(data);
	}
	for (const element of activeRateBase) {
		const data = await id2Guild(element.guildId);
		if (typeof data === "string") continue;
		activeRate.push(data);
	}
	for (const { id, bumpCounter } of await database.user.findMany({
		orderBy: {
			bumpCounter: "desc"
		},
		take: 50
	})) {
		const cacheData = await cache.discord.users.checkCache(id);
		if (cacheData) {
			users.push({ ...cacheData, ...{ count: bumpCounter ?? 0 } });
			continue;
		}
		const user = await discord.bot.control.user.fetch(id);
		if (user) {
			users.push({
				userId: user.id,
				avatarUrl: user.avatarURL(),
				username: user.username,
				displayName: user.displayName,
				count: bumpCounter ?? 0
			});
		}
	}
	return json(
		{
			level,
			activeRate,
			users
		} satisfies ResponseJson["post"],
		{ status: 200 }
	);
}) satisfies RequestHandler;

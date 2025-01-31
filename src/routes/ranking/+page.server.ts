import { database } from "$lib/server/Database/index";
import { discord } from "$lib/server/discord";
import { id2Guild } from "$lib/server/guild";

import type { Guild } from "$lib/server/guild";
import type { PageServerLoad } from "./$types";

export type User = {
	userId: string
	avatarUrl: string | null
	username: string
	displayName: string
	count: number
}

const searchTypes = [
	"activeRate",
	"level",
	"userBump"
] as const;

export type SearchTypes = typeof searchTypes[number];

function parseSearchType(content: string) {
	for (const searchType of searchTypes) {
		if (searchType === content) {
			return searchType
		}
	}
	return null;
}

export const load = (async (e) => {
	const searchTypeBase = e.url.searchParams.get("type");
	const searchType: SearchTypes = searchTypeBase ? parseSearchType(searchTypeBase) ?? "activeRate" : "activeRate";
	const levelBase = await database.guildTables.level.ranking(50);
	const activeRateBase = await database.guildTables.activeRate.ranking(50);

	const users: User[] = [];
	const level: Guild[] = []
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
	for (const { userId, count } of await database.userBump.ranking(50)) {
		const user = await discord.bot.control.user.fetchUser(userId);
		if (user) {
			users.push({
				userId: user.id,
				avatarUrl: user.avatarURL(),
				username: user.username,
				displayName: user.displayName,
				count,
			});
		}
	}

	return {
		searchType,
		level,
		activeRate,
		users,
	}
}) satisfies PageServerLoad;

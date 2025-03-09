import { database } from "$lib/server/Database/index";
import { discord } from "$lib/server/discord";
import { id2Guild } from "$lib/server/guild";
import { cache } from "$lib/server/Cache/index";

import type { User } from "$lib/server/Cache/Discord/Discord.users";
import type { Guild } from "$lib/server/guild";
import type { PageServerLoad } from "./$types";

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

	return {
		searchType,
	}
}) satisfies PageServerLoad;

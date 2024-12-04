import { database } from "$project/src/lib/server/Database";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
	const level = await database.guildTables.level.ranking(50);
	const activeRate = await database.guildTables.activeRate.ranking(50);

	return {
		level,
		activeRate,
	}
}) satisfies PageServerLoad;

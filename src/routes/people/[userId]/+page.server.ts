import { database } from "$lib/server/Database/index";

import type { PageServerLoad } from "./$types"

export const load = (async (e) => {
	const { userId } = e.params;
	const user = await database.dangerousPeople.fetch(userId);

	return {
		userId,
		user,
		score: await database.dangerousPeople.score.fetch(userId),
		tags: (await database.dangerousPeople.tag.findUserTags(userId)).map(value => value.content),
	}
}) satisfies PageServerLoad;

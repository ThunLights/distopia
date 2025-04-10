import { id2Guild } from "$lib/server/guild";

import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
	const eventId = e.params.eventId;
	return {
		eventId
	};
}) satisfies PageServerLoad;

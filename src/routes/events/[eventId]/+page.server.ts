import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
	const eventId = e.params.eventId;
	return {
		eventId
	};
}) satisfies PageServerLoad;

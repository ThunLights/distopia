import { DPDB } from "$lib/dangerousPeople";

import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
	const { userId } = e.params;

	for (const data of DPDB) {
		if (data.userId === userId) {
			return {
				userId,
				user: data
			};
		}
	}

	return { userId, user: null };
}) satisfies PageServerLoad;

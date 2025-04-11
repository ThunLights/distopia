import { getMeridiem } from "$lib/time";

import type { PageServerLoad } from "./$types";

export const load = (async () => {
	return {
		bg: getMeridiem("ja")
	};
}) satisfies PageServerLoad;

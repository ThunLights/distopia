import { getMeridiem } from "$lib/time.svelte";

import type { PageServerLoad } from "./$types";

export const load = (async () => {
	return {
		bg: getMeridiem("ja"),
	}
}) satisfies PageServerLoad;

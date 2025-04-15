import { DPDB } from "$lib/dangerousPeople";

import type { PageServerLoad } from "./$types";

export const load = (async () => {
	//	const pageQuery = Number(e.url.searchParams.get("page") ?? "0");
	//	const page = pageQuery > 0 ? pageQuery : 1;

	return {
		count: DPDB.length,
		peoples: DPDB
	};
}) satisfies PageServerLoad;

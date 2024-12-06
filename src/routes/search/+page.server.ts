import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
	const searchWord = e.url.searchParams.get("content") ?? "";
	return {
		searchWord: decodeURIComponent(searchWord),
	}
}) satisfies PageServerLoad;

import type { PageServerLoad } from "./$types";

const searchTypes = ["activeRate", "level", "userBump"] as const;

export type SearchTypes = (typeof searchTypes)[number];

function parseSearchType(content: string) {
	for (const searchType of searchTypes) {
		if (searchType === content) {
			return searchType;
		}
	}
	return null;
}

export const load = (async (e) => {
	const searchTypeBase = e.url.searchParams.get("type");
	const searchType: SearchTypes = searchTypeBase
		? (parseSearchType(searchTypeBase) ?? "activeRate")
		: "activeRate";

	return {
		searchType
	};
}) satisfies PageServerLoad;

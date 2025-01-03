import type { PageServerLoad } from "./$types"

export const load = (async (e) => {
	const { userId } = e.params;

	return {
		userId,
	}
}) satisfies PageServerLoad;

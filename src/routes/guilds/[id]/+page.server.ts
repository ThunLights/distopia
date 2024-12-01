import { id2Guild } from "$lib/server/guild";

import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
    const guildId = e.params.id;
	const guild = await id2Guild(guildId);
	if (typeof guild === "string") {
		return {
			guildId,
			content: null,
		}
	}
    return {
        guildId,
		content: guild,
    }
}) satisfies PageServerLoad;

import type { PageLoad } from "./$types";

export const load = (async (e) => {
    return {
        guildId: e.params.id,
    }
}) satisfies PageLoad;

import type { PageServerLoad } from "./$types";

export const ssr = true;

export const load = (async (e) => {
    const guildId = e.params.id;
    return {
        guildId
    }
}) satisfies PageServerLoad;

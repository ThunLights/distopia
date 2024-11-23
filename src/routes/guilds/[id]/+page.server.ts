import { database, DatabaseError } from "$lib/server/Database";

import type { PageServerLoad } from "./$types";

export const load = (async (e) => {
    const guildId = e.params.id;
    const guild = await database.guildTables.guild.id2Data(guildId);
    const tags = await database.guildTables.tag.data(guildId);
    if (guild instanceof DatabaseError) {
        return {
            guildId,
            guild: null,
            tags,
        }
    }
    return {
        guildId,
        guild,
        tags,
    }
}) satisfies PageServerLoad;

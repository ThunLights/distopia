import { deDepulication } from "$lib/array";
import { errorHandling, ServerError } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildTagTable {
    constructor(private readonly table: Prisma.GuildTagDelegate<DefaultArgs>) {}

	public async delete(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

    async data(guildId: string): Promise<string[]> {
        try {
            return (await this.table.findMany({ where: { guildId } })).map(value => value.tag);
        } catch (error) {
            errorHandling(error);
            return []
        }
    }

    async update(guildId: string, guildTags: string[]) {
        try {
            const tags = deDepulication(guildTags);
            await this.table.deleteMany({
                where: {
                    guildId,
                }
            })
            for (const tag of tags) {
                await this.table.create({
                    data: {
                        guildId,
                        tag,
                    }
                })
            }
            return {
                guildId,
                tags,
            }
        } catch (error) {
            errorHandling(error);
            return new ServerError("ERROR")
        }
    }
}

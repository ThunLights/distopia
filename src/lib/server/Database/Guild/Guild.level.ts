import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildLevelTable {
    constructor(private readonly table: Prisma.GuildLevelDelegate<DefaultArgs>) {}

	public async delete(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	async data(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

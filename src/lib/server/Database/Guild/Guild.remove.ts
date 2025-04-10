import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Removed {
	constructor(private readonly table: Prisma.GuildRemovedDelegate<DefaultArgs>) {}

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async fetchExpirationElements() {
		try {
			const limit = new Date(Date.now() - 24 * 60 * 60 * 1000);
			return await this.table.findMany({
				where: {
					date: {
						lte: limit
					}
				}
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async add(guildId: string) {
		try {
			const date = new Date();
			const element = await this.table.findFirst({ where: { guildId } });
			if (!element) {
				await this.table.create({ data: { guildId, date } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async remove(guildId: string) {
		try {
			return await this.table.deleteMany({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

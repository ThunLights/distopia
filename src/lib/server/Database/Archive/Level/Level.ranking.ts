import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class LevelRankingTable {
	constructor(private readonly table: Prisma.ArchiveLevelRankingDelegate<DefaultArgs>) {}

	public async data(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(guildId: string, content: bigint) {
		try {
			const data = { guildId, content };
			const element = await this.table.findFirst({ where: { guildId } });
			if (element) {
				if (content < element.content) {
					await this.table.updateMany({ where: { guildId }, data });
				}
			} else {
				await this.table.create({ data });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async remove(guildId: string) {
		try {
			return await this.table.deleteMany({
				where: { guildId }
			});
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

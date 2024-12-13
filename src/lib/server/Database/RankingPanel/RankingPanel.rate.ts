import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class RankingPanelRate {
	constructor(private readonly table: Prisma.RankingPanelRateDelegate<DefaultArgs>) {}

	public async findMany() {
		try {
			return (await this.table.findMany()).map(value => value.messageId);
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async update(guildId: string, messageId: string) {
		try {
			const element = await this.table.findFirst({
				where: { guildId }
			});
			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { guildId, messageId },
				})
			} else {
				await this.table.create({
					data: { guildId, messageId }
				})
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

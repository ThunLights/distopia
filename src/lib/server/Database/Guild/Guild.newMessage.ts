import { formatDate, getThirtyDaysAgo } from "$lib/server/date";
import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildNewMessageTable {
	constructor(private readonly table: Prisma.GuildNewMessageDelegate<DefaultArgs>) {}

	public async update(guildId: string) {
		try {
			const now = new Date(formatDate(new Date()));
			const element = await this.table.findFirst({
				where: { guildId, date: now },
			});
			if (element) {
				await this.table.updateMany({
					where: { guildId, date: now },
					data: {
						guildId,
						count: element.count + 1,
						date: now,
					}
				})
			} else {
				await this.table.create({
					data: {
						guildId,
						count: 1,
						date: now,
					}
				})
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async thirtyDays(guildId: string) {
		try {
			const thirtyDaysAgo = getThirtyDaysAgo(new Date());
			return await this.table.findMany({
				where: {
					guildId,
					date: {
						gte: thirtyDaysAgo,
					}
				}
			})
		} catch (error) {
			errorHandling(error);
			return []
		}
	}
}

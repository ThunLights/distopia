import { formatDate, getThirtyDaysAgo } from "$lib/server/date";
import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildVcMemberSum {
    constructor(private readonly table: Prisma.GuildVcMemberSumDelegate<DefaultArgs>) {}

	public async update(guildId: string, userId: string) {
		try {
			const now = new Date(formatDate(new Date()));
			const element = await this.table.findFirst({
				where: { guildId, userId },
			});
			if (element) {
				await this.table.updateMany({
					where: { guildId, userId },
					data: { date: now },
				});
			} else {
				await this.table.create({
					data: { guildId, userId, date: now }
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
			return [];
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

import { formatDate } from "$lib/server/date";
import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class VcMemberUpperTwo {
    constructor(private readonly table: Prisma.GuildVcMemberUpperTwoDelegate<DefaultArgs>) {}

	public async update(guildId: string, count: number) {
		try {
			const now = new Date(formatDate(new Date()));
			const element = await this.table.findFirst({
				where: { guildId, date: now },
			});
			if (element) {
				await this.table.updateMany({
					where: { guildId, date: now },
					data: {
						count: element.count + count,
					}
				})
			} else {
				await this.table.create({
					data: { guildId, count, date: now },
				})
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

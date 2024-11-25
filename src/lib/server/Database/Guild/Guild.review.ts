import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export type Review = {
	guildId: string
	userId: string
	star: number
	content?: string
}

export class GuildReviewTable {
    constructor(private readonly table: Prisma.GuildReviewDelegate<DefaultArgs>) {}

	async update(data: Review) {
		try {
			const where = {
				guildId: data.guildId,
				userId: data.userId
			};
			const element = await this.table.findFirst({ where });
			if (element) {
				await this.table.updateMany({where, data})
			} else {
				await this.table.create({ data });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

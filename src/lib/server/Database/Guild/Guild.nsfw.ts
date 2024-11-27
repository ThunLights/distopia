import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildNSFWTable {
	constructor(private readonly table: Prisma.GuildNSFWDelegate<DefaultArgs>) {}

	async data(guildId: string) {
		try {
			const data = await this.table.findFirst({ where: { id: guildId }});
			return data ? data.content : false;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	async update(guildId: string, content: boolean) {
		try {
			const data = {
				id: guildId,
				content,
			}
			const element = await this.table.findFirst({ where: { id: guildId }});
			if (element) {
				await this.table.updateMany({
					where: {
						id: element.id
					},
					data
				})
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

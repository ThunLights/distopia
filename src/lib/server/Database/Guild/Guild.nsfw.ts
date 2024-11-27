import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildNSFWTable {
	constructor(private readonly table: Prisma.GuildNSFWDelegate<DefaultArgs>) {}

	async data(guildId: string) {
		try {
			return await this.table.findFirst({ where: { id: guildId }});
		} catch (error) {
			errorHandling(error);
			return null;
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

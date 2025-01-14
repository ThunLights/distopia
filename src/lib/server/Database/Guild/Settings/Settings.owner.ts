import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Owner {
	constructor(private readonly table: Prisma.ActingOwnerDelegate<DefaultArgs>) {}

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async delete(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async update(guildId: string, userId: string) {
		try {
			const element = await this.table.findFirst({ where: { guildId } });
			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { userId },
				})
			} else {
				await this.table.create({ data: { guildId, userId } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

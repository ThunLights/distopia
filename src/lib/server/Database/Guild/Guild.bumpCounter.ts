import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class BumpCounter {
	constructor(private readonly table: Prisma.BumpCounterDelegate<DefaultArgs>) {}

	public async remove(guildId: string) {
		try {
			return await this.table.deleteMany({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(guildId: string) {
		try {
			const element = await this.table.findFirst({ where: { guildId } });
			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { count: element.count + 1 }
				});
			} else {
				await this.table.create({
					data: { guildId, count: 1 }
				});
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

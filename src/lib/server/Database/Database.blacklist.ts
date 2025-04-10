import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class DatabaseBlackList {
	constructor(private readonly table: Prisma.BlackListDelegate<DefaultArgs>) {}

	public async fetch(userId: string) {
		try {
			return await this.table.findFirst({ where: { userId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(userId: string, description: string) {
		try {
			const element = await this.table.findFirst({ where: { userId } });
			if (element) {
				await this.table.updateMany({
					where: { userId },
					data: { description }
				});
			} else {
				await this.table.create({ data: { userId, description } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async remove(userId: string) {
		try {
			return await this.table.deleteMany({ where: { userId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

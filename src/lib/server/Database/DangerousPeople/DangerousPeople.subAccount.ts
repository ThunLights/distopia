import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class SubAccount {
	constructor(private readonly table: Prisma.DangerousPeopleSubAccountDelegate<DefaultArgs>) {}

	public async fetch(mainId: string) {
		try {
			return await this.table.findMany({ where: { mainId } });
		} catch (error)  {
			errorHandling(error);
			return [];
		}
	}

	public async update(userId: string, mainId: string) {
		try {
			const element = await this.table.findFirst({ where: { userId } });
			if (element) {
				await this.table.updateMany({
					where: { userId },
					data: { mainId },
				});
			} else {
				await this.table.create({ data: { userId, mainId } });
			}
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async delete(mainId: string, userId?: string) {
		try {
			return await this.table.deleteMany({ where: { mainId, userId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { errorHandling } from "../error";

export class UserBumpCounter {
	constructor(private readonly table: Prisma.UserBumpCounterDelegate<DefaultArgs>) {}

	public async ranking(take?: number) {
		try {
			return await this.table.findMany({
				orderBy: {
					count: "desc"
				},
				take
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async update(userId: string) {
		try {
			const element = await this.table.findFirst({ where: { userId } });
			if (element) {
				await this.table.updateMany({
					where: { userId },
					data: { count: element.count + 1 }
				});
			} else {
				await this.table.create({ data: { userId, count: 1 } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async fetch(userId: string) {
		try {
			return await this.table.findFirst({ where: { userId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class DangerousPeopleScore {
	constructor(private readonly table: Prisma.DangerousPeopleScoreDelegate<DefaultArgs>) {}

	public async fetch(userId: string) {
		try {
			const elements = await this.table.findMany({ where: { userId } });
			return elements.map(value => value.content);
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async update(userId: string, content: string) {
		try {
			const element = await this.table.findFirst({ where: { userId, content } });
			if (!element) {
				await this.table.create({ data: { userId, content } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async delete(userId: string) {
		try {
			await this.table.deleteMany({ where: { userId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

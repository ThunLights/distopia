import { dedepulication } from "$lib/array";
import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class DangerousPeopleTag {
	constructor(private readonly table: Prisma.DangerousPeopleTagDelegate<DefaultArgs>) {}

	public async search(content: string) {
		try {
			return dedepulication(
				await this.table.findMany({
					where: {
						content: {
							contains: content
						}
					}
				})
			).map((value) => value.userId);
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async delete(userId: string, content?: string) {
		try {
			await this.table.deleteMany({
				where: { userId, content }
			});
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async update(userId: string, content: string) {
		try {
			const element = await this.table.findFirst({ where: { userId, content } });
			if (!element) {
				await this.table.create({
					data: { userId, content }
				});
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async findUserTags(userId?: string) {
		try {
			return await this.table.findMany({
				where: { userId }
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}
}

import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Avatar {
	constructor(private readonly table: Prisma.AvatarDelegate<DefaultArgs>) {}

	public async data(id: string) {
		try {
			const data = await this.table.findFirst({ where: { id } });
			return data ? data.content : null;
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(id: string, avatar: string) {
		try {
			const element = await this.table.findFirst({ where: { id } });
			if (element) {
				await this.table.updateMany({
					where: {
						id: element.id
					},
					data: {
						content: avatar
					}
				});
			} else {
				await this.table.create({
					data: {
						id,
						content: avatar
					}
				});
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class FriendTag {
	constructor(private readonly table: Prisma.FriendTagDelegate<DefaultArgs>) {}

	public async findUserTags(userId?: string) {
		try {
			return await this.table.findMany({
				where: { userId }
			})
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}
}

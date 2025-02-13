import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class TicketVote {
	constructor(private readonly table: Prisma.TicketVoteDelegate<DefaultArgs>) {}

	public async update(targetUserId: string, userId: string, agree: boolean) {
		try {
			const element = await this.table.findFirst({ where: { targetUserId, userId }});
			if (element) {
				await this.table.updateMany({
					where: { targetUserId, userId },
					data: { agree }
				});
			} else {
				await this.table.create({ data: { targetUserId, userId, agree } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

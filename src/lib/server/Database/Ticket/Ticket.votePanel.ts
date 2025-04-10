import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class TicketVotePanel {
	constructor(private readonly table: Prisma.TicketVotePanelDelegate<DefaultArgs>) {}

	public async fetch(messageId: string) {
		try {
			return await this.table.findFirst({ where: { messageId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(messageId: string, targetUserId: string) {
		try {
			const element = await this.table.findFirst({ where: { messageId } });
			if (element) {
				await this.table.updateMany({
					where: { messageId },
					data: { targetUserId }
				});
			} else {
				await this.table.create({ data: { messageId, targetUserId } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async remove(messageId: string) {
		try {
			return await this.table.deleteMany({ where: { messageId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

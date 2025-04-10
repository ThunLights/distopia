import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class RankingUserBump {
	constructor(private readonly table: Prisma.RankingPanelUserBumpDelegate<DefaultArgs>) {}

	public async findMany() {
		try {
			return (await this.table.findMany()).map((value) => {
				return {
					channelId: value.channelId,
					messageId: value.messageId
				};
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async update(guildId: string, channelId: string, messageId: string) {
		try {
			const element = await this.table.findFirst({
				where: { guildId }
			});
			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { channelId, messageId }
				});
			} else {
				await this.table.create({
					data: { guildId, channelId, messageId }
				});
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

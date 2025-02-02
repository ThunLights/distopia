import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Notice {
	constructor(private readonly table: Prisma.DangerousPeopleNoticeChannelDelegate<DefaultArgs>) {}

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(guildId: string, channelId: string) {
		try {
			const element = await this.table.findFirst({ where: { guildId }});

			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { channelId },
				})
			} else {
				await this.table.create({
					data: { guildId, channelId }
				})
			}

			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async remove(guildId: string) {
		try {
			return await this.table.deleteMany({
				where: { guildId }
			});
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

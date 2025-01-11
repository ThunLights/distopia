import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class BlackList {
	constructor(private readonly table: Prisma.GuildBlackListDelegate<DefaultArgs>) {}

	public async add(guildId: string) {
		try {
			const element = await this.table.findFirst({ where: { guildId } });
			if (element) {
				await this.table.create({ data: { guildId } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async remove(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

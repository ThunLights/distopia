import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export type GuildElement = {
	guildId: string;
	name: string;
	invite: string;
	icon?: string;
	banner?: string;
};

export class GuildInviteTempTable {
	constructor(private readonly table: Prisma.GuildTmpDelegate<DefaultArgs>) {}

	public async datas() {
		try {
			return await this.table.findMany();
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async data(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async delete(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async update(guild: GuildElement) {
		try {
			const { guildId } = guild;
			const element = await this.table.findFirst({ where: { guildId } });
			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: guild
				});
			} else {
				await this.table.create({ data: guild });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

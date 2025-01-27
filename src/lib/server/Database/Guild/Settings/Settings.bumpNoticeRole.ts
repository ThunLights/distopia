import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class BumpNoticeRole {
	constructor(private readonly table: Prisma.BumpNoticeRoleDelegate<DefaultArgs>) {}

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(guildId: string, roleId: string) {
		try {
			const element = await this.table.findFirst({ where: { guildId } });
			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { roleId },
				});
			} else {
				await this.table.create({ data: { guildId, roleId } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async delete(guildId: string) {
		try {
			return await this.table.deleteMany({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}

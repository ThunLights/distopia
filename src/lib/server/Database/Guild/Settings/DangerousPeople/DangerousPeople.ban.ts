import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Ban {
	constructor(private readonly table: Prisma.DangerousPeopleBanBasisDelegate<DefaultArgs>) {}

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async update(guildId: string, baseScore: number) {
		try {
			const element = await this.table.findFirst({ where: { guildId }});
			const score = Math.floor(baseScore);

			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { score },
				})
			} else {
				await this.table.create({
					data: { guildId, score }
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
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

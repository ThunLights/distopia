import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export type Review = {
	guildId: string
	userId: string
	star: number
	content?: string
}

class DeleteReview {
    constructor(private readonly table: Prisma.GuildReviewDelegate<DefaultArgs>) {
	}

	public async target(guildId: string, userId: string) {
		try {
			await this.table.deleteMany({ where: { guildId, userId }});
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async guilds(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async users(userId: string) {
		try {
			await this.table.deleteMany({ where: { userId }});
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

export class GuildReviewTable {
	public readonly delete: DeleteReview;

    constructor(private readonly table: Prisma.GuildReviewDelegate<DefaultArgs>) {
		this.delete = new DeleteReview(table);
	}

	async update(data: Review) {
		try {
			const where = {
				guildId: data.guildId,
				userId: data.userId
			};
			const element = await this.table.findFirst({ where });
			if (element) {
				await this.table.updateMany({where, data})
			} else {
				await this.table.create({ data });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

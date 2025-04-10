import { errorHandling } from "$lib/server/error";
import { z } from "zod";
import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "$lib/constants";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export const _TagsZod = z.string().max(CHARACTER_LIMIT.tag).array().max(TAG_COUNT_LIMIT);

export type Tags = z.infer<typeof _TagsZod>;

export class FriendTag {
	constructor(private readonly table: Prisma.FriendTagDelegate<DefaultArgs>) {}

	public async delete(userId: string, content?: string) {
		try {
			await this.table.deleteMany({
				where: { userId, content }
			});
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async update(userId: string, content: string) {
		try {
			const element = await this.table.findFirst({ where: { userId, content } });
			if (!element) {
				await this.table.create({
					data: { userId, content }
				});
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async findUserTags(userId?: string) {
		try {
			return await this.table.findMany({
				where: { userId }
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}
}

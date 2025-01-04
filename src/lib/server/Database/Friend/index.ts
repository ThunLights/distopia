import { errorHandling } from "$lib/server/error";
import { FriendTag } from "./Friend.tag";

import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Friend {
	public readonly tag: FriendTag;

	private readonly table: Prisma.FriendDelegate<DefaultArgs>

	constructor(prisma: PrismaClient) {
		this.table = prisma.friend;
		this.tag = new FriendTag(prisma.friendTag);
	}

	public async findMany(skip?: number) {
		try {
			return await this.table.findMany({
				orderBy: {
					time: "asc"
				},
				take: 50,
				skip: skip ?? 0,
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}
}

import { DangerousPeopleTag } from "./DangerousPeople.tag";

import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class DangerousPeople {
	public readonly tag: DangerousPeopleTag;

	private readonly table: Prisma.FriendDelegate<DefaultArgs>

	constructor(prisma: PrismaClient) {
		this.table = prisma.friend;
		this.tag = new DangerousPeopleTag(prisma.dangerousPeopleTag);
	}
}

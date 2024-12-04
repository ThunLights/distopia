import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildNewMemberTable {
	constructor(private readonly table: Prisma.GuildNewMemberDelegate<DefaultArgs>) {}
}

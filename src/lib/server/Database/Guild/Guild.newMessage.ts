import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildNewMessageTable {
	constructor(private readonly table: Prisma.GuildNewMessageDelegate<DefaultArgs>) {}
}

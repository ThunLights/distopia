import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildTable {
    constructor(private readonly table: Prisma.GuildDelegate<DefaultArgs>) {}
}

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildLevelTable {
    constructor(private readonly table: Prisma.GuildLevelDelegate<DefaultArgs>) {}
}

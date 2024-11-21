import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildBumpTable {
    constructor(private readonly table: Prisma.GuildBumpDelegate<DefaultArgs>) {}
}

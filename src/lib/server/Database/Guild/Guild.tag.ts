import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildTagTable {
    constructor(private readonly table: Prisma.GuildTagDelegate<DefaultArgs>) {}
}

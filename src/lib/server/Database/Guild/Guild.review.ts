import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildReviewTable {
    constructor(private readonly table: Prisma.GuildReviewDelegate<DefaultArgs>) {}
}

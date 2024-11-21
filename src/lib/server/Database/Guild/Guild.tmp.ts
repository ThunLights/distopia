import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildInviteTempTable {
    constructor(private readonly table: Prisma.GuildTmpDelegate<DefaultArgs>) {}
}

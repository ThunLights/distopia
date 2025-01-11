import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Notice {
	constructor(private readonly table: Prisma.DangerousPeopleNoticeChannelDelegate<DefaultArgs>) {}
}

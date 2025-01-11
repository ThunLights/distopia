import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Ban {
	constructor(private readonly table: Prisma.DangerousPeopleBanBasisDelegate<DefaultArgs>) {}
}

import { formatDate } from "$lib/server/date";
import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class VcMemberSum {
    constructor(private readonly table: Prisma.GuildVcMemberSumDelegate<DefaultArgs>) {}

	public async update() {
		try {
			const now = new Date(formatDate(new Date()));
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}

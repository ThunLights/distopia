import { errorHandling } from "$lib/server/error";
import { DangerousPeopleTag } from "./DangerousPeople.tag";

import type { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class DangerousPeople {
	public readonly tag: DangerousPeopleTag;

	private readonly table: Prisma.DangerousPeopleDelegate<DefaultArgs>

	constructor(prisma: PrismaClient) {
		this.table = prisma.dangerousPeople;
		this.tag = new DangerousPeopleTag(prisma.dangerousPeopleTag);
	}

	public async countAll() {
		try {
			return (await this.table.findMany()).length;
		} catch (error) {
			errorHandling(error);
			return 0;
		}
	}

	public async findMany(skip?: number) {
		try {
			return await this.table.findMany({
				orderBy: {
					time: "desc"
				},
				take: 50,
				skip: skip ?? 0,
			});
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}
}

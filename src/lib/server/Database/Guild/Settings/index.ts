import { DangerousPeople } from "./DangerousPeople/index";

import type { PrismaClient } from "@prisma/client";

export class DatabaseGuildSettingsTables {
	public readonly dangerousPeople: DangerousPeople;

	constructor(prisma: PrismaClient) {
		this.dangerousPeople = new DangerousPeople(prisma);
	}
}

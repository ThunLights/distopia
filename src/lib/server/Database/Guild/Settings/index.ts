import { DangerousPeople } from "./DangerousPeople/index";
import { Bump } from "./Settings.bump";

import type { PrismaClient } from "@prisma/client";

export class DatabaseGuildSettingsTables {
	public readonly dangerousPeople: DangerousPeople;
	public readonly bump: Bump

	constructor(prisma: PrismaClient) {
		this.dangerousPeople = new DangerousPeople(prisma);
		this.bump = new Bump(prisma.bumpNotice);
	}
}

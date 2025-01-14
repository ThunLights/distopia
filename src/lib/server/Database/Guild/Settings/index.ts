import { DangerousPeople } from "./DangerousPeople/index";
import { Bump } from "./Settings.bump";
import { Owner } from "./Settings.owner";

import type { PrismaClient } from "@prisma/client";

export class DatabaseGuildSettingsTables {
	public readonly dangerousPeople: DangerousPeople;
	public readonly bump: Bump
	public readonly owner: Owner;

	constructor(prisma: PrismaClient) {
		this.dangerousPeople = new DangerousPeople(prisma);
		this.bump = new Bump(prisma.bumpNotice);
		this.owner = new Owner(prisma.actingOwner);
	}
}

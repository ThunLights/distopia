import { DangerousPeople } from "./DangerousPeople/index";
import { Bump } from "./Settings.bump";
import { BumpNoticeRole } from "./Settings.bumpNoticeRole";
import { Owner } from "./Settings.owner";

import type { PrismaClient } from "@prisma/client";

export class DatabaseGuildSettingsTables {
	public readonly dangerousPeople: DangerousPeople;
	public readonly bump: Bump
	public readonly bumpNoticeRole: BumpNoticeRole;
	public readonly owner: Owner;

	constructor(prisma: PrismaClient) {
		this.dangerousPeople = new DangerousPeople(prisma);
		this.bump = new Bump(prisma.bumpNotice);
		this.bumpNoticeRole = new BumpNoticeRole(prisma.bumpNoticeRole);
		this.owner = new Owner(prisma.actingOwner);
	}
}

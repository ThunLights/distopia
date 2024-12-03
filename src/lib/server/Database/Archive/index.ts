
import { ArchiveLevelTables } from "./Level/index";
import { ArchiveActiveRateTables } from "./ActiveRate/index";

import type { PrismaClient } from "@prisma/client";

export class DatabaseArchiveTables {
	public readonly level: ArchiveLevelTables
	public readonly activeRate: ArchiveActiveRateTables

    constructor(private readonly prisma: PrismaClient) {
		this.level = new ArchiveLevelTables(this.prisma);
		this.activeRate = new ArchiveActiveRateTables(this.prisma);
	}
}

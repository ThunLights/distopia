import { LevelRankingTable } from "./Level.ranking";

import type { PrismaClient } from "@prisma/client";

export class ArchiveLevelTables {
	public readonly ranking: LevelRankingTable

    constructor(private readonly prisma: PrismaClient) {
		this.ranking = new LevelRankingTable(this.prisma.archiveLevelRanking);
	}
}

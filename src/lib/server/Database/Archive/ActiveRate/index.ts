
import { ActiveRateMaxTable } from "./ActiveRate.max";
import { ActiveRateRankingTable } from "./ActiveRate.ranking";

import type { PrismaClient } from "@prisma/client";

export class ArchiveActiveRateTables {
	public readonly max: ActiveRateMaxTable
	public readonly ranking: ActiveRateRankingTable

    constructor(private readonly prisma: PrismaClient) {
		this.max = new ActiveRateMaxTable(this.prisma.archiveActiveRateMax);
		this.ranking = new ActiveRateRankingTable(this.prisma.archiveActiveRateRanking);
	}
}

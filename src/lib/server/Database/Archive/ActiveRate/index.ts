import { DatabaseClient } from "$lib/server/Database/index";
import { ActiveRateMaxTable } from "./ActiveRate.max";
import { ActiveRateRankingTable } from "./ActiveRate.ranking";

export class ArchiveActiveRateTables {
	public readonly max = new ActiveRateMaxTable(DatabaseClient._prisma.archiveActiveRateMax);
	public readonly ranking = new ActiveRateRankingTable(
		DatabaseClient._prisma.archiveActiveRateRanking
	);
}

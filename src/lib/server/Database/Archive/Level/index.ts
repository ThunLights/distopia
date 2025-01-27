import { DatabaseClient } from "$lib/server/Database/index";
import { LevelRankingTable } from "./Level.ranking";

export class ArchiveLevelTables {
	public readonly ranking = new LevelRankingTable(DatabaseClient._prisma.archiveLevelRanking);
}

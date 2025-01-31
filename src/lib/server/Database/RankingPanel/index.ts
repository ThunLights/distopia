import { DatabaseClient } from "../index";
import { RankingPanelLevel } from "./RankingPanel.level";
import { RankingPanelRate } from "./RankingPanel.rate";
import { RankingUserBump } from "./RankingPanel.userBump";

export class DatabaseRankingPanelTables {
	public readonly level = new RankingPanelLevel(DatabaseClient._prisma.rankingPanelLevel);
	public readonly rate = new RankingPanelRate(DatabaseClient._prisma.rankingPanelRate);
	public readonly userBump = new RankingUserBump(DatabaseClient._prisma.rankingPanelUserBump);
}

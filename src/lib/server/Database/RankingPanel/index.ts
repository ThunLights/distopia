import { DatabaseClient } from "../index";
import { RankingPanelLevel } from "./RankingPanel.level";
import { RankingPanelRate } from "./RankingPanel.rate";

export class DatabaseRankingPanelTables {
	public readonly level = new RankingPanelLevel(DatabaseClient._prisma.rankingPanelLevel);
	public readonly rate = new RankingPanelRate(DatabaseClient._prisma.rankingPanelRate);
}

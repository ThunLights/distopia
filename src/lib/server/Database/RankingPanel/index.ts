import { RankingPanelLevel } from "./RankingPanel.level";
import { RankingPanelRate } from "./RankingPanel.rate";

import type { PrismaClient } from "@prisma/client";

export class DatabaseRankingPanelTables {
	public readonly level: RankingPanelLevel;
	public readonly rate: RankingPanelRate;

	constructor(private readonly prisma: PrismaClient) {
		this.level = new RankingPanelLevel(this.prisma.rankingPanelLevel);
		this.rate = new RankingPanelRate(this.prisma.rankingPanelRate);
	}
}

import type { BotFeature } from "presentation-bot-kit/feature";

import { LeaderboardCommand } from "./bot/ChatInputCommand/LeaderboardCommand";
import { RankCommand } from "./bot/ChatInputCommand/RankCommand";

const feature: BotFeature = {
  chatInput: [LeaderboardCommand, RankCommand],
};

export default feature;

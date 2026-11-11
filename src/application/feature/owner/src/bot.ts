import type { BotFeature } from "presentation-bot-kit/feature";

import { PanelRankingLevelButton } from "./bot/Button/PanelRankingLevelButton";
import { PanelRankingRateButton } from "./bot/Button/PanelRankingRateButton";
import { PanelRankingUserBumpButton } from "./bot/Button/PanelRankingUserBumpButton";
import { OwnerCommand } from "./bot/OwnerCommand";

const feature: BotFeature = {
  chatInput: [OwnerCommand],
  button: [PanelRankingLevelButton, PanelRankingRateButton, PanelRankingUserBumpButton],
};

export default feature;

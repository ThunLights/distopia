import type { BotFeature } from "presentation-bot-kit/feature";

import { PageCommand } from "./bot/PageCommand";

const feature: BotFeature = {
  chatInput: [PageCommand],
};

export default feature;

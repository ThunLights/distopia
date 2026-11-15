import type { BotFeature } from "presentation-bot-kit/feature";

import { HelpCommand } from "./bot/HelpCommand";

const feature: BotFeature = {
  chatInput: [HelpCommand],
};

export default feature;

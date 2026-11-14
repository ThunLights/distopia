import type { BotFeature } from "presentation-bot-kit/feature";

import { StaffCommand } from "./bot/StaffCommand";

const feature: BotFeature = {
  chatInput: [StaffCommand],
};

export default feature;

import type { BotFeature } from "presentation-bot-kit/feature";

import { ReviewCommand } from "./bot/ChatInputCommand/ReviewCommand";
import { ReviewModal } from "./bot/Modal/ReviewModal";

const feature: BotFeature = {
  chatInput: [ReviewCommand],
  modal: [ReviewModal],
};

export default feature;

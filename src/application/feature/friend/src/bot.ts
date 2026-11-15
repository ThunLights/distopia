import type { BotFeature } from "presentation-bot-kit/feature";

import { FriendCommand } from "./bot/FriendCommand";
import { FriendModal } from "./bot/FriendModal";

const feature: BotFeature = {
  chatInput: [FriendCommand],
  modal: [FriendModal],
};

export default feature;

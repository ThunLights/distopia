import type { BotFeature } from "presentation-bot-kit/feature";

import { RolePanelCommand } from "./bot/ChatInputCommand/RolePanelCommand";
import { RolePanelSelectMenu } from "./bot/StringSelectMenu/RolePanelSelectMenu";

const feature: BotFeature = {
  chatInput: [RolePanelCommand],
  stringSelectMenu: [RolePanelSelectMenu],
};

export default feature;

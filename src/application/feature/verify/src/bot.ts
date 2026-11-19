import type { BotFeature } from "presentation-bot-kit/feature";

import { VerifyAdminCommand } from "./bot/ChatInputCommand/VerifyAdminCommand";
import { GuildMemberAddEvent } from "./bot/Event/GuildMemberAdd";

const feature: BotFeature = {
  chatInput: [VerifyAdminCommand],
  events: [GuildMemberAddEvent],
};

export default feature;

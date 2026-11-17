import type { BotFeature } from "presentation-bot-kit/feature";

import { GuildMemberAddEvent } from "./bot/Event/GuildMemberAdd";
import { MessageCreateEvent } from "./bot/Event/MessageCreate";

const feature: BotFeature = {
  events: [MessageCreateEvent, GuildMemberAddEvent],
};

export default feature;

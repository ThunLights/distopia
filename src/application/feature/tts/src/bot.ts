import type { BotFeature } from "presentation-bot-kit/feature";

import { TtsAdminCommand } from "./bot/ChatInputCommand/TtsAdminCommand";
import { TtsCommand } from "./bot/ChatInputCommand/TtsCommand";
import { ClientReadyEvent } from "./bot/Event/ClientReady";
import { MessageCreateEvent } from "./bot/Event/MessageCreate";
import { VoiceStateUpdateEvent } from "./bot/Event/VoiceStateUpdate";

const feature: BotFeature = {
  chatInput: [TtsAdminCommand, TtsCommand],
  events: [ClientReadyEvent, MessageCreateEvent, VoiceStateUpdateEvent],
};

export default feature;

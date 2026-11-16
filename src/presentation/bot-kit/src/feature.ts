import type { AppCore } from "app-core";
import type {
  CacheType,
  ClientEvents,
  InteractionReplyOptions,
  InteractionResponse,
  MessagePayload,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
} from "discord.js";

import type { ButtonInteractionBase } from "./base/ButtonInteractionBase";
import type { ChannelSelectMenuInteractionBase } from "./base/ChannelSelectMenuInteractionBase";
import type { ChatInputCommandBase } from "./base/ChatInputCommandBase";
import type { MessageComponentInteractionBase } from "./base/MessageComponentInteractionBase";
import type { ModalSubmitInteractionBase } from "./base/ModalSubmitInteractionBase";
import type { UserSelectMenuInteractionBase } from "./base/UserSelectMenuInteractionBase";
import type { SettingsEntry } from "./settings";

export type Commands = {
  chatInput: ChatInputCommandBase[];
  button: ButtonInteractionBase[];
  modal: ModalSubmitInteractionBase[];
  roleSelectMenu: MessageComponentInteractionBase<
    RoleSelectMenuInteraction<CacheType>,
    string | MessagePayload | InteractionReplyOptions | InteractionResponse
  >[];
  channelSelectMenu: ChannelSelectMenuInteractionBase[];
  stringSelectMenu: MessageComponentInteractionBase<
    StringSelectMenuInteraction<CacheType>,
    string | MessagePayload | InteractionReplyOptions | InteractionResponse
  >[];
  userSelectMenu: UserSelectMenuInteractionBase[];
};

// Returned by a listener to stop the event there: later features' listeners don't run, and
// the bot handler skips whatever it would have done after emitting.
export class SkipOtherProcess {}

export type FeatureEventListener<K extends keyof ClientEvents> = (
  core: AppCore,
  ...args: ClientEvents[K]
) => Promise<void | SkipOtherProcess>;

// presentation-bot's own handler for each event decides when these run (e.g. not for a
// message it just deleted as spam), so a listener only sees events that survived that.
export type FeatureEvents = { [K in keyof ClientEvents]?: FeatureEventListener<K> };

// The "./bot" export of a src/application/feature/* package default-exports one of these;
// app-feature-loader collects them for presentation-bot.
export type BotFeature = {
  [K in keyof Commands]?: (new (core: AppCore) => Commands[K][number])[];
} & {
  // Registered on the /settings panel via addSettings (presentation-bot-kit/settings).
  settings?: SettingsEntry[];
  events?: FeatureEvents;
};

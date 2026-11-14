import type { AppCore } from "app-core";
import type {
  CacheType,
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

// The "./bot" export of a src/application/feature/* package default-exports one of these;
// app-feature-loader collects them for presentation-bot.
export type BotFeature = {
  [K in keyof Commands]?: (new (core: AppCore) => Commands[K][number])[];
} & {
  // Registered on the /settings panel via addSettings (presentation-bot-kit/settings).
  settings?: SettingsEntry[];
};

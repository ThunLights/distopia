import {
  InteractionCallbackResponse,
  Message,
  MessageFlags,
  type CacheType,
  type Interaction,
} from "discord.js";

import { BaseHandler } from "../BaseHandler";
import { ModalSended, type ButtonInteractionBase } from "./Base/ButtonInteractionBase";
import type { ChatInputCommandBase } from "./Base/ChatInputCommandBase";
import type { ModalSubmitInteractionBase } from "./Base/ModalSubmitInteractionBase";
import { commands as buttonCommands } from "./Buttons.auto";
import { commands as chatInputCommands } from "./ChatInputCommands.auto";
import { commands as ModalCommands } from "./Modals.auto";

type Commands = {
  chatInput: ChatInputCommandBase[];
  button: ButtonInteractionBase[];
  modal: ModalSubmitInteractionBase[];
};

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public readonly commands: Commands = {
    chatInput: chatInputCommands.map((Command) => new Command(this.core)),
    button: buttonCommands.map((Command) => new Command(this.core)),
    modal: ModalCommands.map((Command) => new Command(this.core)),
  };

  public override async handle(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isChatInputCommand()) {
      for (const command of this.commands.chatInput) {
        if (await command.match(interaction)) {
          const res = await command.run(interaction);
          if (res instanceof InteractionCallbackResponse) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
      return void (await interaction.reply({
        content: "コマンドが見つかりませんでした",
        flags: [MessageFlags.Ephemeral],
      }));
    } else if (interaction.isButton()) {
      for (const command of this.commands.button) {
        if (await command.match(interaction)) {
          const res = await command.run(interaction);
          if (res instanceof Message || res instanceof ModalSended) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
      return void (await interaction.reply({
        content: "コマンドが見つかりませんでした",
        flags: [MessageFlags.Ephemeral],
      }));
    } else if (interaction.isModalSubmit()) {
      for (const command of this.commands.modal) {
        if (await command.match(interaction)) {
          const res = await command.run(interaction);
          if (res instanceof Message) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
    }
  }
}

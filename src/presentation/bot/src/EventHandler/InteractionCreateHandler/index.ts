import {
  InteractionCallbackResponse,
  Message,
  MessageFlags,
  type CacheType,
  type Interaction,
} from "discord.js";

import { BaseHandler } from "../BaseHandler";
import { type ButtonInteractionBase } from "./Base/ButtonInteractionBase";
import type { ChatInputCommandBase } from "./Base/ChatInputCommandBase";
import { ModalSended } from "./Base/Modal/ModalSended";
import type { ModalSubmitInteractionBase } from "./Base/ModalSubmitInteractionBase";
import type { UserSelectMenuInteractionBase } from "./Base/UserSelectMenuInteractionBase";
import { commands as buttonCommands } from "./Buttons.auto";
import { commands as chatInputCommands } from "./ChatInputCommands.auto";
import { commands as modalCommands } from "./Modals.auto";
import { commands as userSelectMenus } from "./UserSelectMenus.auto";

type Commands = {
  chatInput: ChatInputCommandBase[];
  button: ButtonInteractionBase[];
  modal: ModalSubmitInteractionBase[];
  userSelectMenu: UserSelectMenuInteractionBase[];
};

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public readonly commands: Commands = {
    chatInput: chatInputCommands.map((Command) => new Command(this.core)),
    button: buttonCommands.map((Command) => new Command(this.core)),
    modal: modalCommands.map((Command) => new Command(this.core)),
    userSelectMenu: userSelectMenus.map((Menu) => new Menu(this.core)),
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
    } else if (interaction.isUserSelectMenu()) {
      for (const menu of this.commands.userSelectMenu) {
        if (await menu.match(interaction)) {
          const res = await menu.run(interaction);
          if (res instanceof Message) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
    }

    if (interaction.isRepliable()) {
      return void (await interaction.reply({
        content: "コマンドが見つかりませんでした",
        flags: [MessageFlags.Ephemeral],
      }));
    }
  }
}

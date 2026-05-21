import {
  EmbedBuilder,
  InteractionCallbackResponse,
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type Interaction,
} from "discord.js";

import { BaseHandler } from "../BaseHandler";
import { type ButtonInteractionBase } from "./Base/ButtonInteractionBase";
import type { ChatInputCommandBase } from "./Base/ChatInputCommandBase";
import { ModalSended } from "./Base/Modal/ModalSended";
import type { ModalSubmitInteractionBase } from "./Base/ModalSubmitInteractionBase";
import type { RoleSelectMenuInteractionBase } from "./Base/RoleSelectMenuInteractionBase";
import type { StringSelectMenuInteractionBase } from "./Base/StringSelectMenuInteractionBase";
import type { UserSelectMenuInteractionBase } from "./Base/UserSelectMenuInteractionBase";
import { commands as buttonCommands } from "./Buttons.auto";
import { commands as chatInputCommands } from "./ChatInputCommands.auto";
import { commands as modalCommands } from "./Modals.auto";
import { commands as roleSelectMenus } from "./RoleSelectMenus.auto";
import { commands as stringSelectMenus } from "./StringSelectMenus.auto";
import { commands as userSelectMenus } from "./UserSelectMenus.auto";

type Commands = {
  chatInput: ChatInputCommandBase[];
  button: ButtonInteractionBase[];
  modal: ModalSubmitInteractionBase[];
  roleSelectMenu: RoleSelectMenuInteractionBase[];
  stringSelectMenu: StringSelectMenuInteractionBase[];
  userSelectMenu: UserSelectMenuInteractionBase[];
};

const lateLimitEmbed = new EmbedBuilder()
  .setTitle("レートリミット")
  .setColor("Red")
  .setDescription("連続で実行しすぎです。数秒待ってから実行してください。");

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public readonly commands: Commands = {
    chatInput: chatInputCommands.map((Command) => new Command(this.core)),
    button: buttonCommands.map((Command) => new Command(this.core)),
    modal: modalCommands.map((Command) => new Command(this.core)),
    roleSelectMenu: roleSelectMenus.map((Menu) => new Menu(this.core)),
    stringSelectMenu: stringSelectMenus.map((Menu) => new Menu(this.core)),
    userSelectMenu: userSelectMenus.map((Menu) => new Menu(this.core)),
  };

  public override async handle(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isChatInputCommand()) {
      const limit = await this.core.latelimit.getChatInputCommand(interaction.user.id);

      for (const command of this.commands.chatInput) {
        if (await command.match(interaction)) {
          const res = await command.run(interaction);

          if (limit) {
            return void (await interaction.reply({
              embeds: [lateLimitEmbed],
              flags: [MessageFlags.Ephemeral],
            }));
          }

          if (res instanceof InteractionCallbackResponse || res instanceof ModalSended) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
    } else if (interaction.isButton()) {
      const limit = await this.core.latelimit.getButton(interaction.user.id);

      for (const command of this.commands.button) {
        if (await command.match(interaction)) {
          const res = await command.run(interaction);

          if (limit) {
            return void (await interaction.reply({
              embeds: [lateLimitEmbed],
              flags: [MessageFlags.Ephemeral],
            }));
          }

          if (res instanceof InteractionResponse || res instanceof ModalSended) {
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
          if (res instanceof InteractionResponse) {
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
          if (res instanceof InteractionResponse) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
    } else if (interaction.isRoleSelectMenu()) {
      for (const menu of this.commands.roleSelectMenu) {
        if (await menu.match(interaction)) {
          const res = await menu.run(interaction);
          if (res instanceof InteractionResponse) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      for (const menu of this.commands.stringSelectMenu) {
        if (await menu.match(interaction)) {
          const res = await menu.run(interaction);
          if (res instanceof InteractionResponse) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
    }

    if (interaction.isRepliable()) {
      console.log("Hello");
      return void (await interaction.reply({
        content: "コマンドが見つかりませんでした",
        flags: [MessageFlags.Ephemeral],
      }));
    }
  }
}

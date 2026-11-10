import { features } from "app-feature-loader/bot";
import {
  EmbedBuilder,
  InteractionCallbackResponse,
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type Interaction,
} from "discord.js";
import { ModalSended } from "presentation-bot-kit/base/Modal/ModalSended";
import type { Commands } from "presentation-bot-kit/feature";

import { BaseHandler } from "../BaseHandler";
import { commands as buttonCommands } from "./Buttons.auto";
import { commands as channelSelectMenus } from "./ChannelSelectMenus.auto";
import { commands as chatInputCommands } from "./ChatInputCommands.auto";
import { commands as modalCommands } from "./Modals.auto";
import { commands as roleSelectMenus } from "./RoleSelectMenus.auto";
import { commands as stringSelectMenus } from "./StringSelectMenus.auto";
import { commands as userSelectMenus } from "./UserSelectMenus.auto";

const rateLimitEmbed = new EmbedBuilder()
  .setTitle("レートリミット")
  .setColor("Red")
  .setDescription("連続で実行しすぎです。数秒待ってから実行してください。");

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public readonly commands: Commands = {
    chatInput: [...chatInputCommands, ...features.flatMap((f) => f.chatInput ?? [])].map(
      (Command) => new Command(this.core),
    ),
    button: [...buttonCommands, ...features.flatMap((f) => f.button ?? [])].map(
      (Command) => new Command(this.core),
    ),
    modal: [...modalCommands, ...features.flatMap((f) => f.modal ?? [])].map(
      (Command) => new Command(this.core),
    ),
    roleSelectMenu: [...roleSelectMenus, ...features.flatMap((f) => f.roleSelectMenu ?? [])].map(
      (Menu) => new Menu(this.core),
    ),
    channelSelectMenu: [
      ...channelSelectMenus,
      ...features.flatMap((f) => f.channelSelectMenu ?? []),
    ].map((Menu) => new Menu(this.core)),
    stringSelectMenu: [
      ...stringSelectMenus,
      ...features.flatMap((f) => f.stringSelectMenu ?? []),
    ].map((Menu) => new Menu(this.core)),
    userSelectMenu: [...userSelectMenus, ...features.flatMap((f) => f.userSelectMenu ?? [])].map(
      (Menu) => new Menu(this.core),
    ),
  };

  public override async handle(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isChatInputCommand()) {
      const limit = await this.core.ratelimit.getChatInputCommand(interaction.user.id);

      for (const command of this.commands.chatInput) {
        if (await command.match(interaction)) {
          if (limit) {
            return void (await interaction.reply({
              embeds: [rateLimitEmbed],
              flags: [MessageFlags.Ephemeral],
            }));
          }

          await this.core.ratelimit.saveChatInputCommand(interaction.user.id);

          const res = await command.run(interaction);

          if (res instanceof InteractionCallbackResponse || res instanceof ModalSended) {
            return;
          } else {
            return void (await interaction.reply(res));
          }
        }
      }
    } else if (interaction.isButton()) {
      const limit = await this.core.ratelimit.getButton(interaction.user.id);

      for (const command of this.commands.button) {
        if (await command.match(interaction)) {
          if (limit) {
            return void (await interaction.reply({
              embeds: [rateLimitEmbed],
              flags: [MessageFlags.Ephemeral],
            }));
          }

          await this.core.ratelimit.saveButton(interaction.user.id);

          const res = await command.run(interaction);

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
    } else if (interaction.isChannelSelectMenu()) {
      for (const menu of this.commands.channelSelectMenu) {
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
      return void (await interaction.reply({
        content: "コマンドが見つかりませんでした",
        flags: [MessageFlags.Ephemeral],
      }));
    }
  }
}

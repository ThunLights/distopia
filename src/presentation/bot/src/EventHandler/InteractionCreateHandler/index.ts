import {
  InteractionCallbackResponse,
  MessageFlags,
  type CacheType,
  type Interaction,
} from "discord.js";

import { BaseHandler } from "../BaseHandler";
import type { ButtonInteractionBase } from "./Base/ButtonInteractionBase";
import type { ChatInputCommandBase } from "./Base/ChatInputCommandBase";
import { commands as buttonCommands } from "./Buttons.auto";
import { commands as chatInputCommands } from "./ChatInputCommands.auto";

type Commands = {
  chatInput: ChatInputCommandBase[];
  button: ButtonInteractionBase[];
};

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public readonly commands: Commands = {
    chatInput: chatInputCommands.map((Command) => new Command(this.core)),
    button: buttonCommands.map((Command) => new Command(this.core)),
  };

  public override async handle(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isChatInputCommand()) {
      for (const command of this.commands.chatInput) {
        if (await command.match(interaction)) {
          const res = await command.run(interaction);
          if (!(res instanceof InteractionCallbackResponse)) {
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
          return void (await interaction.reply(res));
        }
      }
      return void (await interaction.reply({
        content: "コマンドが見つかりませんでした",
        flags: [MessageFlags.Ephemeral],
      }));
    }
  }
}

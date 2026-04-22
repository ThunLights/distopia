import {
  InteractionCallbackResponse,
  MessageFlags,
  type CacheType,
  type Interaction,
} from "discord.js";

import { BaseHandler } from "../BaseHandler";
import type { ChatInputCommandBase } from "./Base/ChatInputCommandBase";
import { commands as chatInputCommands } from "./ChatInputCommands.auto";

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public readonly commands: ChatInputCommandBase[] = chatInputCommands.map(
    (Command) => new Command(this.core),
  );

  public override async handle(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isChatInputCommand()) {
      for (const command of this.commands) {
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
    }
  }
}

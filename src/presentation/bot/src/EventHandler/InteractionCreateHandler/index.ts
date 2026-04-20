import { MessageFlags, type CacheType, type Interaction } from "shared-lib/discord.js";

import { BaseHandler } from "../BaseHandler";
import { getCommands } from "./commands.auto";

export class InteractionCreateHandler extends BaseHandler<
  (interaction: Interaction<CacheType>) => void
> {
  public readonly commands = getCommands(this.client, this.appData);

  public override async handle(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isChatInputCommand()) {
      for (const command of this.commands) {
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

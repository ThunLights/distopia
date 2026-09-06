import {
  type CacheType,
  type ChatInputCommandInteraction,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { CommandInteractionBase } from "./CommanInteractionBase";

export abstract class ChatInputCommandBase<
  O extends {} = {},
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody =
    RESTPostAPIChatInputApplicationCommandsJSONBody,
> extends CommandInteractionBase<O, ChatInputCommandInteraction<CacheType>> {
  public abstract readonly register: T;
  // A single guild ID, multiple guild IDs (registered to each), or null for a global command.
  public readonly availableGuildId: string | readonly string[] | null = null;

  public override async match(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.commandName === this.register.name;
  }
}

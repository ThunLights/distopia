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
  public abstract readonly regist: T;

  public override async match(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.commandName === this.regist.name;
  }
}

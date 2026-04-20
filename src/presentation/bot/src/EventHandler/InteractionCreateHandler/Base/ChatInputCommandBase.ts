import {
  MessagePayload,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "shared-lib/discord.js";

import { Base } from "./Base";

export class ParseOptionsError {}

export abstract class ChatInputCommandBase<
  O = {},
  T extends RESTPostAPIChatInputApplicationCommandsJSONBody =
    RESTPostAPIChatInputApplicationCommandsJSONBody,
> extends Base<ChatInputCommandInteraction<CacheType>, void> {
  public abstract readonly regist: T;

  public override async run(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const options = await this.parseOptions(interaction);
    await this.exec(interaction, options);
  }

  public override async match(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.commandName === this.regist.name;
  }

  public abstract parseOptions(interaction: ChatInputCommandInteraction<CacheType>): Promise<O>;

  protected abstract exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: O,
  ): Promise<string | InteractionReplyOptions | MessagePayload>;
}

import {
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {};

export class HelpCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "help",
    description: "ヘルプを表示",
  };

  public override async parseOptions(
    _interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {};
  }

  protected override async exec(
    _interaction: ChatInputCommandInteraction<CacheType>,
    _options: Options,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    return {
      content: "https://distopia.top/help",
      flags: [MessageFlags.Ephemeral],
    } satisfies InteractionReplyOptions;
  }
}

import {
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { GuildParseError } from "../Base/Base";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {};

export class BumpCommand extends ChatInputCommandBase<Options> {
  public override regist: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "bump",
    description: "サーバーの表示順を上げる",
  };

  public override async parseOptions(
    _interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {};
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    _options: Options,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    const guild = await this.parseGuild(interaction);
    const _user = await this.parseUser(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    return {};
  }
}

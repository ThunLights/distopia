import { URL } from "node:url";

import {
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

type Options = {};

export class PageCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "page",
    description: "このサーバーのページを表示",
  };

  public override async parseOptions(
    _interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {};
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    _options: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const registeredGuild = await this.core.guild.find(guild.id);

    if (registeredGuild) {
      return {
        content: new URL(`/guilds/${registeredGuild.guildId}`, this.core.state.url).toString(),
        flags: [MessageFlags.Ephemeral],
      };
    } else {
      return {
        content: "サーバーが見つかりませんでした。登録が済んでいるか確認してみてください",
        flags: [MessageFlags.Ephemeral],
      };
    }
  }
}

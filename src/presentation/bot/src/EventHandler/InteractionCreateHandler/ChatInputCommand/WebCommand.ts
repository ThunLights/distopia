import {
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { page } from "../Page/WebEdit";

type Options = {};

export class WebCommand extends ChatInputCommandBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "web",
    description: "サーバーのWeb設定を変更できます。",
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

    return await page(this.core, guild);
  }
}

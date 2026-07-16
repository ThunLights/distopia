import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ChannelSelectMenuInteractionBase } from "../Base/ChannelSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { statChannelPage } from "../Page/StatChannelPage";

export class StatChannelBotsSelectMenu extends ChannelSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "statChannelBotsSelect";

  protected override async exec(
    interaction: ChannelSelectMenuInteraction<CacheType>,
    options: { channelId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({
      guildId: guild.id,
      statChannelBots: options.channelId,
    });

    const settingPage = await statChannelPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

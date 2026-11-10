import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";
import { ChannelSelectMenuInteractionBase } from "presentation-bot-kit/base/ChannelSelectMenuInteractionBase";
import { GuildParseError } from "presentation-bot-kit/base/Error/GuildParseError";

import { assignStatChannel } from "../../StatChannel";
import { statChannelPage } from "../StatChannelPage";

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

    if (!(await this.core.state.discord.channel.existsVoiceChannel(options.channelId))) {
      return { content: "ボイスチャンネルを選択してください。", flags: [MessageFlags.Ephemeral] };
    }

    await assignStatChannel(this.core, guild.id, "statChannelBots", options.channelId);

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

import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { isWelcomeMessageField, welcomeMessageLabels } from "../../../utils/welcomeMessage";
import { ChannelSelectMenuInteractionBase } from "../Base/ChannelSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { welcomeMessagePage } from "../Page/WelcomeMessagePage";

const customIdPrefix = "welcomeMessageChannel:";

export class WelcomeMessageChannelSelectMenu extends ChannelSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(
    interaction: ChannelSelectMenuInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ChannelSelectMenuInteraction<CacheType>,
    options: { channelId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const field = interaction.customId.slice(customIdPrefix.length);

    if (!isWelcomeMessageField(field)) {
      return { content: `${field}は無効な選択肢です`, flags: [MessageFlags.Ephemeral] };
    }

    const channelField = welcomeMessageLabels[field].channelField;

    await this.core.guild.saveSetting({ guildId: guild.id, [channelField]: options.channelId });

    const welcomeMessagePagePayload = await welcomeMessagePage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = welcomeMessagePagePayload;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

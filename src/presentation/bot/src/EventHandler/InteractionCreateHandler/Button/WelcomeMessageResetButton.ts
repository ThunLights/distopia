import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { isWelcomeMessageField, welcomeMessageLabels } from "../../../utils/welcomeMessage";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { welcomeMessagePage } from "../Page/WelcomeMessagePage";

const customIdPrefix = "welcomeMessageReset:";

export class WelcomeMessageResetButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const field = interaction.customId.slice(customIdPrefix.length);

    if (!isWelcomeMessageField(field)) {
      return { content: `${field}は無効な選択肢です`, flags: [MessageFlags.Ephemeral] };
    }

    const label = welcomeMessageLabels[field];

    await this.core.guild.saveSetting({
      guildId: guild.id,
      [label.channelField]: null,
      [label.contentField]: null,
    });

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

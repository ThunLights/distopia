import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class LogBulkSetButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "logBulkSet";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle("ログ設定: 一括設定")
      .setDescription("出力先のチャンネルを選択してください。");

    const channelSelector = new ChannelSelectMenuBuilder()
      .setCustomId("logBulkSetChannel")
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);

    const backButton = new ButtonBuilder()
      .setCustomId("backLogPage")
      .setLabel("ログ設定に戻る")
      .setStyle(ButtonStyle.Secondary);

    return await interaction.update({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelector),
        new ActionRowBuilder<ButtonBuilder>().addComponents(backButton),
      ],
    });
  }
}

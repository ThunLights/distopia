import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionResponse,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { LOG_FIELDS, logFieldLabels } from "../../../utils/log";
import { ChannelSelectMenuInteractionBase } from "../Base/ChannelSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class LogBulkSetChannelSelectMenu extends ChannelSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "logBulkSetChannel";

  protected override async exec(
    interaction: ChannelSelectMenuInteraction<CacheType>,
    options: { channelId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle("ログ設定: 一括設定")
      .setDescription(
        `<#${options.channelId}> に出力するログの種類を選択してください。(複数選択可)`,
      );

    const fieldSelector = new StringSelectMenuBuilder()
      .setCustomId(`logBulkSetFields:${options.channelId}`)
      .setPlaceholder("ログの種類を選択")
      .setMinValues(1)
      .setMaxValues(LOG_FIELDS.length)
      .addOptions(
        LOG_FIELDS.map((field) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(logFieldLabels[field].shortLabel)
            .setValue(field),
        ),
      );

    const backButton = new ButtonBuilder()
      .setCustomId("backLogPage")
      .setLabel("ログ設定に戻る")
      .setStyle(ButtonStyle.Secondary);

    return await interaction.update({
      embeds: [embed],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(fieldSelector),
        new ActionRowBuilder<ButtonBuilder>().addComponents(backButton),
      ],
    });
  }
}

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionResponse,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { LOG_FIELDS, logFieldLabels } from "../../../utils/logging/log";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class LogBulkClearButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "logBulkClear";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle("ログ設定: 一括解除")
      .setDescription("解除するログの種類を選択してください。(複数選択可)");

    const fieldSelector = new StringSelectMenuBuilder()
      .setCustomId("logBulkClearFields")
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

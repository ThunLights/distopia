import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { LOG_FIELDS, logFieldLabels } from "../../../utils/logging/log";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function logPage(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const settings = await core.guild.getSetting(guild.id);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ログ設定")
    .setDescription("以下から設定したいログの種類を選択してください。")
    .addFields(
      LOG_FIELDS.map((field) => {
        const channelId = settings?.[field];

        return {
          name: logFieldLabels[field].shortLabel,
          value: channelId ? `<#${channelId}>` : "未設定",
          inline: true,
        };
      }),
    );

  const selector = new StringSelectMenuBuilder()
    .setCustomId("logCategory")
    .setPlaceholder("ログカテゴリを選択")
    .addOptions(
      LOG_FIELDS.map((field) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(logFieldLabels[field].shortLabel)
          .setValue(field),
      ),
    );

  const bulkSetButton = new ButtonBuilder()
    .setCustomId("logBulkSet")
    .setLabel("一括設定")
    .setStyle(ButtonStyle.Success);

  const bulkClearButton = new ButtonBuilder()
    .setCustomId("logBulkClear")
    .setLabel("一括解除")
    .setStyle(ButtonStyle.Danger);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        await backSettingsPageButton(),
        bulkSetButton,
        bulkClearButton,
      ),
    ],
  };
}

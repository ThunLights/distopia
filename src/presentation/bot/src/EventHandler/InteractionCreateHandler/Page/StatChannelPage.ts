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

import { statChannelLabels } from "../../../utils/statChannel";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function statChannelPage(
  core: AppCore,
  guild: Guild,
): Promise<InteractionReplyOptions> {
  const settings = await core.guild.getSetting(guild.id);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("統計チャンネル設定")
    .setDescription(
      "登録したボイスチャンネルの名前を、メンバー数やアクティブレートで自動的に更新します。人が参加できないよう権限を制限したVCの利用を推奨します。",
    )
    .addFields(
      {
        name: "全メンバー数",
        value: settings?.statChannelAllMembers ? `<#${settings.statChannelAllMembers}>` : "未設定",
      },
      {
        name: "ユーザー数",
        value: settings?.statChannelUsers ? `<#${settings.statChannelUsers}>` : "未設定",
      },
      {
        name: "Bot数",
        value: settings?.statChannelBots ? `<#${settings.statChannelBots}>` : "未設定",
      },
      {
        name: "アクティブレート",
        value: settings?.statChannelActiveRate ? `<#${settings.statChannelActiveRate}>` : "未設定",
      },
      {
        name: "アクティブレートランキング",
        value: settings?.statChannelActiveRateRanking
          ? `<#${settings.statChannelActiveRateRanking}>`
          : "未設定",
      },
    );

  const selector = new StringSelectMenuBuilder()
    .setCustomId("statChannel")
    .setPlaceholder("設定するタイプを選択")
    .addOptions(
      Object.entries(statChannelLabels).map(([value, { shortLabel }]) =>
        new StringSelectMenuOptionBuilder().setLabel(shortLabel).setValue(value),
      ),
    );

  const setupSelector = new StringSelectMenuBuilder()
    .setCustomId("statChannelSetup")
    .setPlaceholder("セットアップするタイプを選択(複数選択可)")
    .setMinValues(1)
    .setMaxValues(Object.keys(statChannelLabels).length)
    .addOptions(
      Object.entries(statChannelLabels).map(([value, { shortLabel }]) =>
        new StringSelectMenuOptionBuilder().setLabel(shortLabel).setValue(value),
      ),
    );

  const bulkSetupButton = new ButtonBuilder()
    .setCustomId("statChannelBulkSetup")
    .setLabel("未設定を一括セットアップ")
    .setStyle(ButtonStyle.Success);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector),
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(setupSelector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        await backSettingsPageButton(),
        bulkSetupButton,
      ),
    ],
  };
}

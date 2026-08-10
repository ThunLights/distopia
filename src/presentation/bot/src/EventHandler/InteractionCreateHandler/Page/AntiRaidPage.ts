import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function antiRaidPage(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const settings = await core.guild.getSetting(guild.id);

  const inviteLinkBlockStatus =
    settings?.inviteLinkBlock === undefined ? "未設定" : settings.inviteLinkBlock ? "On" : "Off";

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("荒らし対策設定")
    .setDescription("以下から変更したい項目を選択してください。")
    .addFields(
      {
        name: "招待リンクブロック",
        value: inviteLinkBlockStatus,
        inline: false,
      },
      {
        name: "ログチャンネル",
        value: settings?.logAntiRaid ? `<#${settings.logAntiRaid}>` : "未設定",
        inline: false,
      },
    );

  const selector = new StringSelectMenuBuilder()
    .setCustomId("antiRaidSetting")
    .setPlaceholder("変更要素を選択")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("招待リンクブロック")
        .setValue("inviteLinkBlock"),
      new StringSelectMenuOptionBuilder().setLabel("ログチャンネル設定").setValue("logAntiRaid"),
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(await backSettingsPageButton()),
    ],
  };
}

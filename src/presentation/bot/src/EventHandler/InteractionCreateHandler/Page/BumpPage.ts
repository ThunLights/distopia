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

export async function bumpPage(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const settings = await core.guild.getSetting(guild.id);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("Bump設定")
    .setDescription("以下から変更したい項目を選択してください。")
    .addFields(
      { name: "Bump通知", value: settings?.bumpNotice ? "有効" : "無効", inline: false },
      {
        name: "Bump通知用ロール",
        value: settings?.bumpNoticeRole ? `<@&${settings.bumpNoticeRole}>` : "未設定",
        inline: false,
      },
      { name: "Bump通知内容", value: settings?.bumpNoticeContent ?? "未設定", inline: false },
    );

  const selector = new StringSelectMenuBuilder()
    .setCustomId("bumpSetting")
    .setPlaceholder("変更要素を選択")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Bump通知 ON/OFF").setValue("bumpNotice"),
      new StringSelectMenuOptionBuilder().setLabel("Bump通知ロール").setValue("bumpRole"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Bump時のメッセージを変更")
        .setValue("bumpNoticeContent"),
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(await backSettingsPageButton()),
    ],
  };
}

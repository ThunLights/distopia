import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  RoleSelectMenuBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function ticketPage(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const settings = await core.guild.getSetting(guild.id);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("チケット設定")
    .setDescription(
      "問い合わせ用の非公開チャンネルをパネルのボタンから作成できます。ログチャンネルを設定すると、閉じたチケットの履歴が保存されます。",
    )
    .addFields(
      {
        name: "カテゴリ",
        value: settings?.ticketCategory ? `<#${settings.ticketCategory}>` : "未設定",
        inline: false,
      },
      {
        name: "対応ロール",
        value: settings?.ticketRole ? `<@&${settings.ticketRole}>` : "未設定",
        inline: false,
      },
      {
        name: "ログチャンネル",
        value: settings?.ticketLogChannel ? `<#${settings.ticketLogChannel}>` : "未設定",
        inline: false,
      },
    );

  const categorySelector = new ChannelSelectMenuBuilder()
    .setCustomId("ticketCategory")
    .setPlaceholder("チケットを作成するカテゴリ")
    .setChannelTypes(ChannelType.GuildCategory);
  const roleSelector = new RoleSelectMenuBuilder()
    .setCustomId("ticketRole")
    .setPlaceholder("チケットに対応するロール");
  const logSelector = new ChannelSelectMenuBuilder()
    .setCustomId("ticketLogChannel")
    .setPlaceholder("ログチャンネル")
    .setChannelTypes(ChannelType.GuildText);

  const panelButton = new ButtonBuilder()
    .setCustomId("ticketPanel")
    .setLabel("このチャンネルにパネルを設置")
    .setStyle(ButtonStyle.Success);
  const resetButton = new ButtonBuilder()
    .setCustomId("ticketReset")
    .setLabel("リセット")
    .setStyle(ButtonStyle.Danger);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(categorySelector),
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelector),
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(logSelector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        await backSettingsPageButton(),
        resetButton,
        panelButton,
      ),
    ],
  };
}

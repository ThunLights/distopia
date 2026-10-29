import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { joinLinesWithinLimit } from "../../../utils/discordLimits";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

const EMBED_DESCRIPTION_LIMIT = 4096;

export async function stickyMessagePage(
  core: AppCore,
  guild: Guild,
): Promise<InteractionReplyOptions> {
  const entries = await core.stickyMessage.getAll(guild.id);

  const intro =
    "チャンネルの一番下に常に表示されるメッセージを設定できます。設定・変更・削除したいチャンネルを選択してください。";
  const list =
    entries.length === 0
      ? "設定されているチャンネルはありません。"
      : joinLinesWithinLimit(
          entries.map((entry) => `<#${entry.channelId}>: ${entry.content.slice(0, 50)}`),
          EMBED_DESCRIPTION_LIMIT - intro.length - 2,
        );

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ピン止めメッセージ設定")
    .setDescription(`${intro}\n\n${list}`);

  const channelSelector = new ChannelSelectMenuBuilder()
    .setCustomId("stickyMessageChannel")
    .setPlaceholder("チャンネルを選択")
    .setMaxValues(1)
    .addChannelTypes(ChannelType.GuildText);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(await backSettingsPageButton()),
    ],
  };
}

export async function stickyMessageChannelPage(
  core: AppCore,
  guild: Guild,
  channelId: string,
): Promise<InteractionReplyOptions> {
  const sticky = await core.stickyMessage.find(guild.id, channelId);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ピン止めメッセージ設定")
    .addFields(
      { name: "チャンネル", value: `<#${channelId}>` },
      { name: "現在の内容", value: sticky?.content.slice(0, 1024) ?? "未設定" },
    );

  const contentButton = new ButtonBuilder()
    .setCustomId(`stickyMessageContentSubmit:${channelId}`)
    .setLabel("内容を設定")
    .setStyle(ButtonStyle.Primary);

  const deleteButton = new ButtonBuilder()
    .setCustomId(`stickyMessageDelete:${channelId}`)
    .setLabel("削除")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(!sticky);

  const backButton = new ButtonBuilder()
    .setCustomId("backStickyMessagePage")
    .setLabel("ピン止めメッセージ設定に戻る")
    .setStyle(ButtonStyle.Secondary);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(backButton, contentButton, deleteButton),
    ],
  };
}

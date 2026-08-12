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

import { WELCOME_MESSAGE_FIELDS, welcomeMessageLabels } from "../../../utils/welcomeMessage";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function welcomeMessagePage(
  core: AppCore,
  guild: Guild,
): Promise<InteractionReplyOptions> {
  const settings = await core.guild.getSetting(guild.id);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("入退出メッセージ設定")
    .setDescription(
      "以下から設定したい種類を選択してください。チャンネルを未設定にすると通知はOFFになります。",
    )
    .addFields(
      WELCOME_MESSAGE_FIELDS.flatMap((field) => {
        const label = welcomeMessageLabels[field];
        const channelId = settings?.[label.channelField];
        const content = settings?.[label.contentField];

        return [
          {
            name: `${label.shortLabel}: チャンネル`,
            value: channelId ? `<#${channelId}>` : "未設定(OFF)",
            inline: true,
          },
          {
            name: `${label.shortLabel}: 内容`,
            value: content ?? "未設定(デフォルト文言)",
            inline: true,
          },
        ];
      }),
    );

  const selector = new StringSelectMenuBuilder()
    .setCustomId("welcomeMessageCategory")
    .setPlaceholder("設定する種類を選択")
    .addOptions(
      WELCOME_MESSAGE_FIELDS.map((field) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(welcomeMessageLabels[field].shortLabel)
          .setValue(field),
      ),
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(await backSettingsPageButton()),
    ],
  };
}

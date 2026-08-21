import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { blackListActionLabels, truncateSelectMenuLabel } from "../../../utils/blackList";

export async function blackListDetailPage(
  core: AppCore,
  guild: Guild,
  blackListId: number,
): Promise<InteractionReplyOptions> {
  const [list, application] = await Promise.all([
    core.blackList.find(blackListId),
    core.blackList.findApplication(guild.id, blackListId),
  ]);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(`ブラックリスト \`${blackListId}\` の適用状況`)
    .setDescription(
      application
        ? [
            `処理: ${blackListActionLabels[application.action]}`,
            `BANするタグ: ${application.banTags.length ? application.banTags.join(", ") : "なし"}`,
            `ログチャンネル: ${application.logChannel ? `<#${application.logChannel}>` : "未設定"}`,
          ].join("\n")
        : "このブラックリストは適用されていません。",
    );

  const backButton = new ButtonBuilder()
    .setCustomId("backBlackListPage")
    .setStyle(ButtonStyle.Danger)
    .setLabel("ブラックリスト設定に戻る");

  const components: (
    | ActionRowBuilder<ButtonBuilder>
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ChannelSelectMenuBuilder>
  )[] = [];

  if (application && list?.tags.length) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`blackListBanTags:${blackListId}`)
          .setPlaceholder("BANするタグを選択 (該当したら参加時にBAN)")
          .setMinValues(0)
          .setMaxValues(list.tags.length)
          .addOptions(
            list.tags.map((tag) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(truncateSelectMenuLabel(tag))
                .setValue(tag)
                .setDefault(application.banTags.includes(tag)),
            ),
          ),
      ),
    );
  }

  if (application) {
    components.push(
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId(`blackListLogChannel:${blackListId}`)
          .setPlaceholder("このブラックリストのログチャンネルを設定")
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
      ),
    );
  }

  const bottomRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

  if (application) {
    bottomRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`blackListLogChannelReset:${blackListId}`)
        .setLabel("ログチャンネルをリセット")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`blackListUnapply:${blackListId}`)
        .setLabel("解除する")
        .setStyle(ButtonStyle.Danger),
    );
  }

  components.push(bottomRow);

  return {
    embeds: [embed],
    components,
  };
}

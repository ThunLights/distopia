import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { blackListActionLabels } from "../../../utils/blackList";

export async function blackListDetailPage(
  core: AppCore,
  guild: Guild,
  blackListId: number,
): Promise<InteractionReplyOptions> {
  const application = await core.blackList.findApplication(guild.id, blackListId);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(`ブラックリスト \`${blackListId}\` の適用状況`)
    .setDescription(
      application
        ? `処理: ${blackListActionLabels[application.action]}`
        : "このブラックリストは適用されていません。",
    );

  const backButton = new ButtonBuilder()
    .setCustomId("backBlackListPage")
    .setStyle(ButtonStyle.Danger)
    .setLabel("ブラックリスト設定に戻る");

  const components = [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton)];

  if (application) {
    components[0]?.addComponents(
      new ButtonBuilder()
        .setCustomId(`blackListUnapply:${blackListId}`)
        .setLabel("解除する")
        .setStyle(ButtonStyle.Danger),
    );
  }

  return {
    embeds: [embed],
    components,
  };
}

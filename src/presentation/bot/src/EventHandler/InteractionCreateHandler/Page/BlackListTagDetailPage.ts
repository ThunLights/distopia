import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type InteractionReplyOptions,
} from "discord.js";

import { encodeBlackListTagRef } from "../../../utils/blackList";

export async function blackListTagDetailPage(
  core: AppCore,
  blackListId: number,
  tag: string,
): Promise<InteractionReplyOptions> {
  const [list, targets] = await Promise.all([
    core.blackList.find(blackListId),
    core.blackList.listTargets(blackListId),
  ]);

  const exists = Boolean(list?.tags.includes(tag));
  const usageCount = targets.filter((target) => target.tags.includes(tag)).length;

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(`タグ: ${tag}`)
    .setDescription(
      exists
        ? `\`${list?.label ?? blackListId}\` のタグです。\n使用状況: ${usageCount}件の対象に付与されています。`
        : "このタグは既に削除されています。",
    );

  const backButton = new ButtonBuilder()
    .setCustomId(`blackListTagsManageOpen:${blackListId}`)
    .setStyle(ButtonStyle.Danger)
    .setLabel("戻る");

  const buttons: ButtonBuilder[] = [backButton];

  if (exists) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`blackListTagRemove:${encodeBlackListTagRef(blackListId, tag)}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("削除"),
    );
  }

  return {
    embeds: [embed],
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
  };
}

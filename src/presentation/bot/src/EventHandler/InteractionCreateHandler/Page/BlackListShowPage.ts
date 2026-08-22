import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type InteractionReplyOptions,
} from "discord.js";

import { buildBlackListFieldValue } from "../../../utils/blackList";
import { encodeIdPageRef, paginate } from "../../../utils/pagination";

export async function blackListShowPage(
  core: AppCore,
  blackListId: number,
  requesterId: string,
  page: number = 0,
): Promise<InteractionReplyOptions> {
  const isOwner = await core.blackList.isOwner(blackListId, requesterId);
  const editor = isOwner ? null : await core.blackList.findEditor(blackListId, requesterId);

  if (!isOwner && !editor) {
    return {
      content: "このブラックリストを閲覧する権限がありません。",
      flags: [MessageFlags.Ephemeral],
    };
  }

  const [list, targets] = await Promise.all([
    core.blackList.find(blackListId),
    core.blackList.listTargets(blackListId),
  ]);

  const {
    items: pageTargets,
    page: currentPage,
    totalPages,
    hasPrev,
    hasNext,
  } = paginate(targets, page);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(
      totalPages > 1
        ? `ブラックリスト \`${blackListId}\` の対象一覧 (${currentPage + 1}/${totalPages}ページ)`
        : `ブラックリスト \`${blackListId}\` の対象一覧`,
    )
    .setDescription(
      buildBlackListFieldValue(
        pageTargets.map(
          (target) =>
            `**${target.label}** <@${target.userId}> (${target.userId}): ${target.description}${target.tags.length ? ` [${target.tags.join(", ")}]` : ""}`,
        ),
      ),
    )
    .addFields({
      name: "利用可能なタグ",
      value: list?.tags.length ? list.tags.join(", ") : "設定されていません",
    });

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (totalPages > 1) {
    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`blackListShowPageNav:${encodeIdPageRef(blackListId, currentPage - 1)}`)
          .setStyle(ButtonStyle.Secondary)
          .setLabel("前へ")
          .setDisabled(!hasPrev),
        new ButtonBuilder()
          .setCustomId(`blackListShowPageNav:${encodeIdPageRef(blackListId, currentPage + 1)}`)
          .setStyle(ButtonStyle.Secondary)
          .setLabel("次へ")
          .setDisabled(!hasNext),
      ),
    );
  }

  return {
    embeds: [embed],
    components,
    flags: [MessageFlags.Ephemeral],
  };
}

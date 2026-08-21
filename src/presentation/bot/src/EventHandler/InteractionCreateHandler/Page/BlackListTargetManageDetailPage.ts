import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
  type InteractionReplyOptions,
} from "discord.js";

import { buildBlackListFieldValue, truncateSelectMenuLabel } from "../../../utils/blackList";
import { encodeIdPageRef, paginate } from "../../../utils/pagination";

export async function blackListTargetManageDetailPage(
  core: AppCore,
  userId: string,
  blackListId: number,
  page: number = 0,
): Promise<InteractionReplyOptions> {
  const [list, targets, canAdd, canEdit, canRemove, isOwner] = await Promise.all([
    core.blackList.find(blackListId),
    core.blackList.listTargets(blackListId),
    core.blackList.hasPermission(blackListId, userId, "AddTarget"),
    core.blackList.hasPermission(blackListId, userId, "EditTarget"),
    core.blackList.hasPermission(blackListId, userId, "RemoveTarget"),
    core.blackList.isOwner(blackListId, userId),
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
    .setTitle(`ブラックリスト: ${list?.label ?? blackListId}`)
    .addFields({
      name:
        totalPages > 1
          ? `登録済みの対象 (${currentPage + 1}/${totalPages}ページ)`
          : "登録済みの対象",
      value: buildBlackListFieldValue(
        targets.map((target) => `**${target.label}** <@${target.userId}> (${target.userId})`),
      ),
    });

  const backButton = new ButtonBuilder()
    .setCustomId("backBlackListTargetManagePage")
    .setStyle(ButtonStyle.Danger)
    .setLabel("ブラックリスト選択に戻る");

  const components: (
    | ActionRowBuilder<UserSelectMenuBuilder>
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ButtonBuilder>
  )[] = [];

  if (canAdd) {
    components.push(
      new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
        new UserSelectMenuBuilder()
          .setCustomId(`blackListTargetPickAddUser:${blackListId}`)
          .setPlaceholder("対象を追加するユーザーを選択")
          .setMaxValues(1),
      ),
    );
  }

  if (pageTargets.length && (canEdit || canRemove)) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`blackListTargetPickManage:${blackListId}`)
          .setPlaceholder("編集・削除する対象を選択")
          .addOptions(
            pageTargets.map((target) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(truncateSelectMenuLabel(target.label))
                .setDescription(truncateSelectMenuLabel(target.description || target.userId))
                .setValue(target.userId),
            ),
          ),
      ),
    );
  }

  const bottomButtons: ButtonBuilder[] = [backButton];

  if (isOwner) {
    bottomButtons.push(
      new ButtonBuilder()
        .setCustomId(`blackListTargetManageEditorsOpen:${blackListId}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel("編集者を管理"),
      new ButtonBuilder()
        .setCustomId(`blackListManageDelete:${blackListId}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("ブラックリストを削除"),
    );
  }

  if (totalPages > 1) {
    bottomButtons.push(
      new ButtonBuilder()
        .setCustomId(
          `blackListTargetManageDetailPageNav:${encodeIdPageRef(blackListId, currentPage - 1)}`,
        )
        .setStyle(ButtonStyle.Secondary)
        .setLabel("前へ")
        .setDisabled(!hasPrev),
      new ButtonBuilder()
        .setCustomId(
          `blackListTargetManageDetailPageNav:${encodeIdPageRef(blackListId, currentPage + 1)}`,
        )
        .setStyle(ButtonStyle.Secondary)
        .setLabel("次へ")
        .setDisabled(!hasNext),
    );
  }

  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(bottomButtons));

  return {
    embeds: [embed],
    components,
  };
}

import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";

import { buildBlackListFieldValue, truncateSelectMenuLabel } from "../../../utils/blackList";
import { paginate } from "../../../utils/pagination";

export async function blackListTargetManagePage(
  core: AppCore,
  userId: string,
  page: number = 0,
): Promise<InteractionReplyOptions> {
  const lists = await core.blackList.findAllEditable(userId);
  const {
    items: pageItems,
    page: currentPage,
    totalPages,
    hasPrev,
    hasNext,
  } = paginate(lists, page);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ブラックリスト対象管理")
    .setDescription("操作したいブラックリストを選択するか、新しく作成してください。")
    .addFields({
      name:
        totalPages > 1
          ? `所有・編集できるブラックリスト (${currentPage + 1}/${totalPages}ページ)`
          : "所有・編集できるブラックリスト",
      value: buildBlackListFieldValue(
        lists.map(
          (list) =>
            `\`${list.id}\` ${list.label} (${list.ownerId === userId ? "オーナー" : "編集者"})`,
        ),
      ),
    });

  const createButton = new ButtonBuilder()
    .setCustomId("blackListManageCreateOpen")
    .setStyle(ButtonStyle.Success)
    .setLabel("新規作成");

  const components: (
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ButtonBuilder>
  )[] = [];

  if (pageItems.length) {
    const selector = new StringSelectMenuBuilder()
      .setCustomId("blackListTargetPickList")
      .setPlaceholder("ブラックリストを選択")
      .addOptions(
        pageItems.map((list) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(truncateSelectMenuLabel(list.label))
            .setDescription(list.ownerId === userId ? "オーナー" : "編集者")
            .setValue(String(list.id)),
        ),
      );

    components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector));
  }

  const bottomButtons: ButtonBuilder[] = [createButton];

  if (totalPages > 1) {
    bottomButtons.push(
      new ButtonBuilder()
        .setCustomId(`blackListTargetManagePageNav:${currentPage - 1}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel("前へ")
        .setDisabled(!hasPrev),
      new ButtonBuilder()
        .setCustomId(`blackListTargetManagePageNav:${currentPage + 1}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel("次へ")
        .setDisabled(!hasNext),
    );
  }

  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(bottomButtons));

  return {
    embeds: [embed],
    components,
    flags: [MessageFlags.Ephemeral],
  };
}

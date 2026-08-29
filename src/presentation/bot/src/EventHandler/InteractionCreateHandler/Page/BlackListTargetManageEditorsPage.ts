import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
  type InteractionReplyOptions,
} from "discord.js";

import {
  blackListEditorPermissionSummary,
  buildBlackListFieldValue,
} from "../../../utils/lists/blackList";
import { encodeIdPageRef, paginate } from "../../../utils/pagination";

export async function blackListTargetManageEditorsPage(
  core: AppCore,
  userId: string,
  blackListId: number,
  page: number = 0,
): Promise<InteractionReplyOptions> {
  if (!(await core.blackList.isOwner(blackListId, userId))) {
    return {
      content: "編集者の管理はブラックリストのオーナーのみ行えます。",
      flags: [MessageFlags.Ephemeral],
    };
  }

  const [list, editors] = await Promise.all([
    core.blackList.find(blackListId),
    core.blackList.listEditors(blackListId),
  ]);

  const {
    items: pageEditors,
    page: currentPage,
    totalPages,
    hasPrev,
    hasNext,
  } = paginate(editors, page);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(`編集者管理: ${list?.label ?? blackListId}`)
    .addFields({
      name: totalPages > 1 ? `編集者一覧 (${currentPage + 1}/${totalPages}ページ)` : "編集者一覧",
      value: buildBlackListFieldValue(
        pageEditors.map(
          (editor) =>
            `<@${editor.userId}> (${editor.userId}): ${blackListEditorPermissionSummary(editor)}`,
        ),
      ),
    });

  const components: (
    | ActionRowBuilder<UserSelectMenuBuilder>
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ButtonBuilder>
  )[] = [
    new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
      new UserSelectMenuBuilder()
        .setCustomId(`blackListTargetPickAddEditor:${blackListId}`)
        .setPlaceholder("編集者を追加するユーザーを選択")
        .setMaxValues(1),
    ),
  ];

  if (pageEditors.length) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`blackListTargetPickEditor:${blackListId}`)
          .setPlaceholder("権限変更・削除する編集者を選択")
          .addOptions(
            pageEditors.map((editor) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(editor.userId)
                .setDescription(blackListEditorPermissionSummary(editor))
                .setValue(editor.userId),
            ),
          ),
      ),
    );
  }

  const bottomButtons: ButtonBuilder[] = [
    new ButtonBuilder()
      .setCustomId(`backBlackListTargetManageDetail:${blackListId}`)
      .setStyle(ButtonStyle.Danger)
      .setLabel("戻る"),
  ];

  if (totalPages > 1) {
    bottomButtons.push(
      new ButtonBuilder()
        .setCustomId(
          `blackListTargetManageEditorsPageNav:${encodeIdPageRef(blackListId, currentPage - 1)}`,
        )
        .setStyle(ButtonStyle.Secondary)
        .setLabel("前へ")
        .setDisabled(!hasPrev),
      new ButtonBuilder()
        .setCustomId(
          `blackListTargetManageEditorsPageNav:${encodeIdPageRef(blackListId, currentPage + 1)}`,
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

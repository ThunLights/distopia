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

import {
  blackListEditorPermissionSummary,
  buildBlackListFieldValue,
} from "../../../utils/blackList";

export async function blackListTargetManageEditorsPage(
  core: AppCore,
  userId: string,
  blackListId: number,
): Promise<InteractionReplyOptions> {
  const [list, editors] = await Promise.all([
    core.blackList.find(blackListId),
    core.blackList.listEditors(blackListId),
  ]);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(`編集者管理: ${list?.label ?? blackListId}`)
    .addFields({
      name: "編集者一覧",
      value: buildBlackListFieldValue(
        editors.map(
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

  if (editors.length) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`blackListTargetPickEditor:${blackListId}`)
          .setPlaceholder("権限変更・削除する編集者を選択")
          .addOptions(
            editors
              .slice(0, 25)
              .map((editor) =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(editor.userId)
                  .setDescription(blackListEditorPermissionSummary(editor))
                  .setValue(editor.userId),
              ),
          ),
      ),
    );
  }

  components.push(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`backBlackListTargetManageDetail:${blackListId}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("戻る"),
    ),
  );

  return {
    embeds: [embed],
    components,
  };
}

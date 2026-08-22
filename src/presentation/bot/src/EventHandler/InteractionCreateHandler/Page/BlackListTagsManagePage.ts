import type { AppCore } from "app-core";
import { NUM_BLACK_LIST_TAG_LIMIT } from "app-core/constant";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";

import { truncateSelectMenuLabel } from "../../../utils/blackList";

export async function blackListTagsManagePage(
  core: AppCore,
  blackListId: number,
): Promise<InteractionReplyOptions> {
  const list = await core.blackList.find(blackListId);
  const tags = list?.tags ?? [];

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(`タグ管理: ${list?.label ?? blackListId}`)
    .setDescription("タグを選択すると詳細・削除ができます。")
    .addFields({
      name: `タグ一覧 (${tags.length}/${NUM_BLACK_LIST_TAG_LIMIT})`,
      value: tags.length ? tags.map((tag) => `\`${tag}\``).join(" ") : "なし",
    });

  const components: (
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ButtonBuilder>
  )[] = [];

  if (tags.length) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`blackListTagPick:${blackListId}`)
          .setPlaceholder("詳細を見るタグを選択")
          .addOptions(
            tags.map((tag) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(truncateSelectMenuLabel(tag))
                .setValue(tag),
            ),
          ),
      ),
    );
  }

  components.push(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`blackListTagAddOpen:${blackListId}`)
        .setLabel("タグを追加")
        .setStyle(ButtonStyle.Success)
        .setDisabled(tags.length >= NUM_BLACK_LIST_TAG_LIMIT),
      new ButtonBuilder()
        .setCustomId("backBlackListTagsPickList")
        .setLabel("戻る")
        .setStyle(ButtonStyle.Danger),
    ),
  );

  return {
    embeds: [embed],
    components,
  };
}

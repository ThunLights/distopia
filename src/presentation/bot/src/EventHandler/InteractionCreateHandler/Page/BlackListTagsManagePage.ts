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
    .setDescription(
      `現在のタグ (${tags.length}/${NUM_BLACK_LIST_TAG_LIMIT}): ${tags.length ? tags.join(", ") : "なし"}`,
    );

  const components: (
    | ActionRowBuilder<StringSelectMenuBuilder>
    | ActionRowBuilder<ButtonBuilder>
  )[] = [];

  if (tags.length) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`blackListTagRemove:${blackListId}`)
          .setPlaceholder("削除するタグを選択")
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
        .setCustomId(`backBlackListTargetManageDetail:${blackListId}`)
        .setLabel("戻る")
        .setStyle(ButtonStyle.Danger),
    ),
  );

  return {
    embeds: [embed],
    components,
  };
}

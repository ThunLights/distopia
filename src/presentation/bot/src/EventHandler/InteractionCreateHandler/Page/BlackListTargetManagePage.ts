import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";

import { buildBlackListFieldValue, truncateSelectMenuLabel } from "../../../utils/blackList";

export async function blackListTargetManagePage(
  core: AppCore,
  userId: string,
): Promise<InteractionReplyOptions> {
  const lists = await core.blackList.findAllEditable(userId);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ブラックリスト対象管理")
    .setDescription("対象を追加・編集・削除したいブラックリストを選択してください。")
    .addFields({
      name: "所有・編集できるブラックリスト",
      value: buildBlackListFieldValue(
        lists.map(
          (list) =>
            `\`${list.id}\` ${list.label} (${list.ownerId === userId ? "オーナー" : "編集者"})`,
        ),
      ),
    });

  if (!lists.length) {
    return { embeds: [embed], flags: [MessageFlags.Ephemeral] };
  }

  const selector = new StringSelectMenuBuilder()
    .setCustomId("blackListTargetPickList")
    .setPlaceholder("ブラックリストを選択")
    .addOptions(
      lists.slice(0, 25).map((list) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(truncateSelectMenuLabel(list.label))
          .setDescription(list.ownerId === userId ? "オーナー" : "編集者")
          .setValue(String(list.id)),
      ),
    );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector)],
    flags: [MessageFlags.Ephemeral],
  };
}

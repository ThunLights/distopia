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

export async function blackListTargetManagePage(
  core: AppCore,
  userId: string,
): Promise<InteractionReplyOptions> {
  const lists = await core.blackList.findAllEditable(userId);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ブラックリスト対象管理")
    .setDescription("操作したいブラックリストを選択するか、新しく作成してください。")
    .addFields({
      name: "所有・編集できるブラックリスト",
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

  if (lists.length) {
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

    components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector));
  }

  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(createButton));

  return {
    embeds: [embed],
    components,
    flags: [MessageFlags.Ephemeral],
  };
}

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

export async function blackListTargetManageDetailPage(
  core: AppCore,
  userId: string,
  blackListId: number,
): Promise<InteractionReplyOptions> {
  const [list, targets, canAdd, canEdit, canRemove] = await Promise.all([
    core.blackList.find(blackListId),
    core.blackList.listTargets(blackListId),
    core.blackList.hasPermission(blackListId, userId, "AddTarget"),
    core.blackList.hasPermission(blackListId, userId, "EditTarget"),
    core.blackList.hasPermission(blackListId, userId, "RemoveTarget"),
  ]);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle(`ブラックリスト: ${list?.label ?? blackListId}`)
    .addFields({
      name: "登録済みの対象",
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

  if (targets.length && (canEdit || canRemove)) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`blackListTargetPickManage:${blackListId}`)
          .setPlaceholder("編集・削除する対象を選択")
          .addOptions(
            targets.slice(0, 25).map((target) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(truncateSelectMenuLabel(target.label))
                .setDescription(truncateSelectMenuLabel(target.description || target.userId))
                .setValue(target.userId),
            ),
          ),
      ),
    );
  }

  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(backButton));

  return {
    embeds: [embed],
    components,
  };
}

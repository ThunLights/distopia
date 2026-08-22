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

export async function blackListTagsPickListPage(
  core: AppCore,
  userId: string,
): Promise<InteractionReplyOptions> {
  const lists = await core.blackList.findAllByOwner(userId);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ブラックリストのタグ管理")
    .setDescription("タグを管理するブラックリストを選択してください。(オーナーのみ)")
    .addFields({
      name: "所有しているブラックリスト",
      value: buildBlackListFieldValue(lists.map((list) => `\`${list.id}\` ${list.label}`)),
    });

  if (!lists.length) {
    return { embeds: [embed], flags: [MessageFlags.Ephemeral] };
  }

  const selector = new StringSelectMenuBuilder()
    .setCustomId("blackListTagsPickList")
    .setPlaceholder("ブラックリストを選択")
    .addOptions(
      lists
        .slice(0, 25)
        .map((list) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(truncateSelectMenuLabel(list.label))
            .setValue(String(list.id)),
        ),
    );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector)],
    flags: [MessageFlags.Ephemeral],
  };
}

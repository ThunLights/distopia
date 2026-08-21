import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

import { blackListActionLabels, buildBlackListFieldValue } from "../../../utils/blackList";
import { paginate } from "../../../utils/pagination";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export async function blackListPage(
  core: AppCore,
  guild: Guild,
  page: number = 0,
): Promise<InteractionReplyOptions> {
  const applied = await core.blackList.getApplied(guild.id);

  const {
    items: pageApplied,
    page: currentPage,
    totalPages,
    hasPrev,
    hasNext,
  } = paginate(applied, page);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ブラックリスト設定")
    .setDescription(
      "自分がオーナー・編集者になっているブラックリストをこのサーバーに適用できます。\nブラックリストのIDは `/blacklist list` で確認できます。\n適用後、処理・BANするタグ・ログチャンネルは一覧から選択して設定できます。",
    )
    .addFields({
      name:
        totalPages > 1
          ? `適用中のブラックリスト (${currentPage + 1}/${totalPages}ページ)`
          : "適用中のブラックリスト",
      value: buildBlackListFieldValue(
        applied.map(
          (entry) =>
            `ID: \`${entry.blackListId}\` (${blackListActionLabels[entry.action]})${entry.autoBan ? " [タグ自動BAN: On]" : ""}${entry.logChannel ? ` - <#${entry.logChannel}>` : ""}`,
        ),
      ),
    });

  const applyButton = new ButtonBuilder()
    .setCustomId("blackListApplyOpen")
    .setLabel("適用・更新する")
    .setStyle(ButtonStyle.Primary);

  const topButtons: ButtonBuilder[] = [applyButton];

  if (totalPages > 1) {
    topButtons.push(
      new ButtonBuilder()
        .setCustomId(`blackListPageNav:${currentPage - 1}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel("前へ")
        .setDisabled(!hasPrev),
      new ButtonBuilder()
        .setCustomId(`blackListPageNav:${currentPage + 1}`)
        .setStyle(ButtonStyle.Secondary)
        .setLabel("次へ")
        .setDisabled(!hasNext),
    );
  }

  const components: (
    | ActionRowBuilder<ButtonBuilder>
    | ActionRowBuilder<StringSelectMenuBuilder>
  )[] = [new ActionRowBuilder<ButtonBuilder>().addComponents(topButtons)];

  if (pageApplied.length) {
    const manageSelector = new StringSelectMenuBuilder()
      .setCustomId("blackListManage")
      .setPlaceholder("管理・解除するブラックリストを選択")
      .addOptions(
        pageApplied.map((entry) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`ID: ${entry.blackListId} (${blackListActionLabels[entry.action]})`)
            .setValue(String(entry.blackListId)),
        ),
      );

    components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(manageSelector));
  }

  components.push(
    new ActionRowBuilder<ButtonBuilder>().addComponents(await backSettingsPageButton()),
  );

  return {
    embeds: [embed],
    components,
  };
}

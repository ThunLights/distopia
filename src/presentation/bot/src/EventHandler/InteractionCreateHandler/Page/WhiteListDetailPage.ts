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

import {
  encodeWhiteListEditAction,
  idTypeLabel,
  mention,
  type WhiteListIdType,
} from "../../../utils/whiteList";

export async function whiteListDetailPage(
  core: AppCore,
  guild: Guild,
  idType: WhiteListIdType,
  targetId: string,
): Promise<InteractionReplyOptions> {
  const entry = await core.guild.findWhiteListEntry(guild.id, targetId);
  const name = await core.state.discord.guild.fetchWhiteListTargetName(guild.id, idType, targetId);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("ホワイトリスト編集")
    .setDescription(
      [
        `対象: ${mention(idType, targetId)}${name ? ` (${name})` : ""} [${idTypeLabel[idType]}]`,
        `現在の権限: ${
          entry
            ? entry.allPermissions
              ? "全許可"
              : entry.permissions.join(", ") || "権限なし"
            : "権限なし"
        }`,
      ].join("\n"),
    );

  const actionSelector = new StringSelectMenuBuilder()
    .setCustomId("whiteListEditAction")
    .setPlaceholder("変更する権限を選択")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("全許可にする")
        .setValue(encodeWhiteListEditAction(idType, targetId, "allOn")),
      new StringSelectMenuOptionBuilder()
        .setLabel("全許可を解除する")
        .setValue(encodeWhiteListEditAction(idType, targetId, "allOff")),
      new StringSelectMenuOptionBuilder()
        .setLabel("招待リンクブロック免除にする")
        .setValue(encodeWhiteListEditAction(idType, targetId, "inviteLinkBlockOn")),
      new StringSelectMenuOptionBuilder()
        .setLabel("招待リンクブロック免除を解除する")
        .setValue(encodeWhiteListEditAction(idType, targetId, "inviteLinkBlockOff")),
    );

  const deleteButton = new ButtonBuilder()
    .setCustomId(`whiteListDelete:${idType}:${targetId}`)
    .setLabel("ホワイトリストから削除")
    .setStyle(ButtonStyle.Danger);

  const backButton = new ButtonBuilder()
    .setCustomId("backWhiteListPage")
    .setLabel("ホワイトリスト設定に戻る")
    .setStyle(ButtonStyle.Secondary);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(actionSelector),
      new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton, backButton),
    ],
  };
}

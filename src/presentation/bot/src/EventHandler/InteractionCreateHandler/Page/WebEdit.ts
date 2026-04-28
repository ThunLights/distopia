import { isBooleanObject } from "util/types";

import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type InteractionReplyOptions,
} from "discord.js";
import type { Guild } from "domain-model";

export async function page(core: AppCore, guild: Guild): Promise<InteractionReplyOptions> {
  const draft = await core.guild.getDraft(guild.id);

  const embed = new EmbedBuilder()
    .setColor("Gold")
    .setTitle("ウェブ公開設定")
    .setURL(core.state.url)
    .setDescription("現在のステータス")
    .setFields(
      { name: "説明文", value: draft.description ?? "未設定", inline: true },
      {
        name: "NSFW",
        value: isBooleanObject(draft.nsfw) ? (draft.nsfw ? "ON" : "OFF") : "未設定",
        inline: true,
      },
      {
        name: "公開設定",
        value: draft.pub !== undefined ? (draft.pub ? "公開" : "非公開") : "未設定",
        inline: true,
      },
      { name: "タグ", value: draft.tag?.join(", ") ?? "未設定", inline: true },
    );

  const cancelButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Danger)
    .setLabel("キャンセル")
    .setCustomId("webEditCancel");
  const changeButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Success)
    .setLabel("変更")
    .setCustomId("webEditChange");
  const submitButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Success)
    .setLabel("保存")
    .setCustomId("webEditSubmit");

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton, changeButton, submitButton),
    ],
    flags: [MessageFlags.Ephemeral],
  };
}

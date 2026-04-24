import { isBooleanObject } from "util/types";

import type { AppCore } from "app-core";
import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
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
        value: draft.visibility ? (draft.visibility === "Public" ? "公開" : "非公開") : "未設定",
        inline: true,
      },
      { name: "タグ", value: draft.tag?.join(", ") ?? "未設定", inline: true },
    );

  const component = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
    new StringSelectMenuBuilder()
      .setCustomId("webEdit")
      .setPlaceholder("変更要素を選択")
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel("招待リンク").setValue("invite"),
        new StringSelectMenuOptionBuilder().setLabel("説明文").setValue("description"),
        new StringSelectMenuOptionBuilder().setLabel("nsfw").setValue("nsfw"),
        new StringSelectMenuOptionBuilder().setLabel("公開設定").setValue("visibility"),
        new StringSelectMenuOptionBuilder().setLabel("タグ").setValue("tag"),
      ),
  );

  return {
    embeds: [embed],
    components: [component],
    flags: [MessageFlags.Ephemeral],
  };
}

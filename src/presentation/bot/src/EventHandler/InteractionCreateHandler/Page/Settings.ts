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
  const settings = await core.guild.getSetting(guild.id);

  const embed = new EmbedBuilder()
    .setColor("Navy")
    .setTitle("設定パネル")
    .setDescription("設定を色々変えられます。")
    .addFields(
      { name: "Bump通知", value: settings?.bumpNotice ? "有効" : "無効", inline: false },
      {
        name: "Bump通知用ロール",
        value: settings?.bumpNoticeRole ? `<@&${settings.bumpNoticeRole}>` : "未設定",
        inline: false,
      },
      { name: "Bump通知内容", value: settings?.bumpNoticeContent ?? "未設定", inline: false },
      {
        name: "オーナー代理",
        value: settings?.actingOwner ? `<@${settings.actingOwner}>` : "未設定",
        inline: false,
      },
    );

  const selector = new StringSelectMenuBuilder()
    .setCustomId("setting")
    .setPlaceholder("変更要素を選択")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("代理オーナー設定").setValue("actingOwner"),
      new StringSelectMenuOptionBuilder().setLabel("Bump通知 ON/OFF").setValue("bumpNotice"),
      new StringSelectMenuOptionBuilder().setLabel("Bumpt通知ロール").setValue("bumpRole"),
      new StringSelectMenuOptionBuilder()
        .setLabel("Bump時のメッセージを変更")
        .setValue("bumpNoticeContent"),
    );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selector)],
    flags: [MessageFlags.Ephemeral],
  };
}

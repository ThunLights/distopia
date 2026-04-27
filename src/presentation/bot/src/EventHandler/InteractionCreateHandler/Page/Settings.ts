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

  const actingOwnerButton = new ButtonBuilder()
    .setCustomId("actingOwner")
    .setLabel("代理オーナー設定")
    .setStyle(ButtonStyle.Danger);
  const bumpNoticeButton = new ButtonBuilder()
    .setCustomId("bumpNotice")
    .setLabel("Bump通知")
    .setStyle(ButtonStyle.Success);
  const bumpRoleButton = new ButtonBuilder()
    .setCustomId("bumpRole")
    .setLabel("Bump通知ロール")
    .setStyle(ButtonStyle.Primary);
  const bumpNoticeContentButton = new ButtonBuilder()
    .setCustomId("bumpNoticeContent")
    .setLabel("Bump時のメッセージを変更")
    .setStyle(ButtonStyle.Primary);

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        actingOwnerButton,
        bumpNoticeButton,
        bumpRoleButton,
        bumpNoticeContentButton,
      ),
    ],
    flags: [MessageFlags.Ephemeral],
  };
}

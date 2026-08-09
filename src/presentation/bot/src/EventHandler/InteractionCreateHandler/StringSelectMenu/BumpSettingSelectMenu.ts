import {
  type StringSelectMenuInteraction,
  type CacheType,
  type MessagePayload,
  type InteractionReplyOptions,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  type PermissionResolvable,
  RoleSelectMenuBuilder,
  InteractionResponse,
} from "discord.js";

import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";

const backBumpPageButton = () =>
  new ButtonBuilder()
    .setCustomId("backBumpPage")
    .setStyle(ButtonStyle.Danger)
    .setLabel("Bump設定に戻る");

export class BumpSettingSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpSetting";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const { value } = options;

    if (value === "bumpNotice") {
      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("Bump通知設定")
        .setDescription("以下のボタンから通知設定を変更可能です。");

      const onButton = new ButtonBuilder()
        .setCustomId("bumpNoticeOn")
        .setLabel("通知ON")
        .setStyle(ButtonStyle.Success);

      const offButton = new ButtonBuilder()
        .setCustomId("bumpNoticeOff")
        .setLabel("通知OFF")
        .setStyle(ButtonStyle.Success);

      return await interaction.update({
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            backBumpPageButton(),
            offButton,
            onButton,
          ),
        ],
      });
    } else if (value === "bumpRole") {
      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("Bump通知: ロール")
        .setDescription("再Bump可能時にロールをメンションします。");

      const roleSelector = new RoleSelectMenuBuilder().setCustomId("bumpRole");

      const resetButton = new ButtonBuilder()
        .setLabel("ロールをリセットする")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("bumpRoleReset");

      return await interaction.update({
        embeds: [embed],
        components: [
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelector),
          new ActionRowBuilder<ButtonBuilder>().addComponents(backBumpPageButton(), resetButton),
        ],
      });
    } else if (value === "bumpNoticeContent") {
      const embed = new EmbedBuilder()
        .setColor("Navy")
        .setTitle("Bumpメッセージ設定")
        .setDescription("Bumpメッセージを設定することができます。");

      const submitButton = new ButtonBuilder()
        .setCustomId("bumpNoticeContentSubmit")
        .setLabel("設定する")
        .setStyle(ButtonStyle.Success);
      const resetButton = new ButtonBuilder()
        .setCustomId("bumpNoticeContentReset")
        .setLabel("リセット")
        .setStyle(ButtonStyle.Danger);

      return await interaction.update({
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            backBumpPageButton(),
            resetButton,
            submitButton,
          ),
        ],
      });
    }

    return {
      content: `${value}は無効な選択肢です`,
      flags: [MessageFlags.Ephemeral],
    };
  }
}

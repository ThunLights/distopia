import {
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  InteractionResponse,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export class BumpNoticeButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpNotice";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
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
          await backSettingsPageButton(),
          offButton,
          onButton,
        ),
      ],
    });
  }
}

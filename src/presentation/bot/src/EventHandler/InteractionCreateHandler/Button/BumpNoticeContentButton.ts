import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type Message,
  type MessagePayload,
  type OmitPartialGroupDMChannel,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { backSettingsPageButton } from "../Component/Button/BackSettingsPageButton";

export class BumpNoticeContentButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpNoticeContent";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | OmitPartialGroupDMChannel<Message<boolean>>
  > {
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

    return await interaction.message.edit({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          await backSettingsPageButton(),
          resetButton,
          submitButton,
        ),
      ],
    });
  }
}

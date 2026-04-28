import { CHARACTER_LIMIT } from "app-core/constant";
import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type Message,
  type MessagePayload,
  type OmitPartialGroupDMChannel,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { ModalSended } from "../Base/Modal/ModalSended";

export class BumpNoticeContentSubmitButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpNoticeContentSubmit";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    | string
    | InteractionReplyOptions
    | MessagePayload
    | OmitPartialGroupDMChannel<Message<boolean>>
    | ModalSended
  > {
    const modal = new ModalBuilder()
      .setCustomId("bumpNoticeContent")
      .setTitle("Bumpメッセージ設定")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("内容")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("content")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(CHARACTER_LIMIT.description),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

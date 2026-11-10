import { CHARACTER_LIMIT } from "app-core/constant";
import {
  InteractionResponse,
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";
import { ButtonInteractionBase } from "presentation-bot-kit/base/ButtonInteractionBase";
import { ModalSended } from "presentation-bot-kit/base/Modal/ModalSended";

export class BumpNoticeContentSubmitButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpNoticeContentSubmit";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse | ModalSended
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

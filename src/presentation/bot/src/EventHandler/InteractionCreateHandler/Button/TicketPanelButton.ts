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

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { ModalSended } from "../Base/Modal/ModalSended";

export class TicketPanelButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "ticketPanel";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse | ModalSended
  > {
    const modal = new ModalBuilder()
      .setCustomId("ticketPanelContent")
      .setTitle("チケットパネル設置")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("タイトル")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("title")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(100)
              .setValue("お問い合わせ"),
          ),
        new LabelBuilder()
          .setLabel("説明")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("description")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(1000)
              .setValue("下のボタンを押すと、スタッフとの専用チャンネルが作成されます。"),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

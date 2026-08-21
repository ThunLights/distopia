import { CHARACTER_LIMIT, MAX_USER_BLACK_LIST_COUNT } from "app-core/constant";
import {
  InteractionResponse,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { ModalSended } from "../Base/Modal/ModalSended";

export class BlackListManageCreateOpenButton extends ButtonInteractionBase {
  public override customId: string = "blackListManageCreateOpen";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse | ModalSended
  > {
    if (!(await this.core.blackList.canCreate(interaction.user.id))) {
      return {
        content: `作成できるブラックリストは${MAX_USER_BLACK_LIST_COUNT}個までです。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    const modal = new ModalBuilder()
      .setCustomId("blackListManageCreate")
      .setTitle("ブラックリストを作成")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("ラベル")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("label")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.blackListLabel),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

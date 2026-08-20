import { CHARACTER_LIMIT } from "app-core/constant";
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

import { BlackListTargetRefSchema, decodeBlackListTargetRef } from "../../../utils/blackList";
import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { ModalSended } from "../Base/Modal/ModalSended";

const customIdPrefix = "blackListTargetEditOpen:";

export class BlackListTargetEditOpenButton extends ButtonInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse | ModalSended
  > {
    const ref = await validator(
      decodeBlackListTargetRef(interaction.customId.slice(customIdPrefix.length)),
      BlackListTargetRefSchema,
    );

    if (ref instanceof ValidateError) {
      return ref.content;
    }

    const { blackListId, userId } = ref;

    const allowed = await this.core.blackList.hasPermission(
      blackListId,
      interaction.user.id,
      "EditTarget",
    );

    if (!allowed) {
      return {
        content: "このブラックリストを編集する権限がありません。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const existing = await this.core.blackList.findTarget(blackListId, userId);

    if (!existing) {
      return { content: "対象が見つかりませんでした。", flags: [MessageFlags.Ephemeral] };
    }

    const modal = new ModalBuilder()
      .setCustomId(`blackListTargetEdit:${blackListId}:${userId}`)
      .setTitle("対象を編集")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("ラベル")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("label")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.blackListLabel)
              .setValue(existing.label),
          ),
        new LabelBuilder()
          .setLabel("説明")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("description")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(CHARACTER_LIMIT.description)
              .setValue(existing.description),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

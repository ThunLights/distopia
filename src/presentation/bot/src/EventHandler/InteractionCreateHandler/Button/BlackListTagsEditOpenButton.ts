import { NUM_BLACK_LIST_TAG_LIMIT } from "app-core/constant";
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
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { ModalSended } from "../Base/Modal/ModalSended";

const customIdPrefix = "blackListTagsEditOpen:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTagsEditOpenButton extends ButtonInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse | ModalSended
  > {
    const blackListId = await validator(
      interaction.customId.slice(customIdPrefix.length),
      BlackListIdSchema,
    );

    if (blackListId instanceof ValidateError) {
      return blackListId.content;
    }

    const isOwner = await this.core.blackList.isOwner(blackListId, interaction.user.id);

    if (!isOwner) {
      return {
        content: "タグの設定はブラックリストのオーナーのみ行えます。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const list = await this.core.blackList.find(blackListId);

    const modal = new ModalBuilder()
      .setCustomId(`blackListTagsEdit:${blackListId}`)
      .setTitle("タグを編集")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel(`タグ (最大${NUM_BLACK_LIST_TAG_LIMIT}個, 1行に1つ)`)
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tags")
              .setRequired(false)
              .setStyle(TextInputStyle.Paragraph)
              .setValue(list?.tags.join("\n") ?? ""),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

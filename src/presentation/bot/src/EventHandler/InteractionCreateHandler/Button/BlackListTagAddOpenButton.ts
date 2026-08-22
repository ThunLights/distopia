import { BLACK_LIST_LIMIT, NUM_BLACK_LIST_TAG_LIMIT } from "app-core/constant";
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

const customIdPrefix = "blackListTagAddOpen:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTagAddOpenButton extends ButtonInteractionBase {
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

    if ((list?.tags.length ?? 0) >= NUM_BLACK_LIST_TAG_LIMIT) {
      return {
        content: `タグは最大${NUM_BLACK_LIST_TAG_LIMIT}個までです。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    const modal = new ModalBuilder()
      .setCustomId(`blackListTagAdd:${blackListId}`)
      .setTitle("タグを追加")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("新しいタグ")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("tag")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(BLACK_LIST_LIMIT.tag)
              .setRequired(true),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

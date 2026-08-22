import { BLACK_LIST_LIMIT } from "app-core/constant";
import {
  InteractionResponse,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import {
  BlackListTargetRefSchema,
  decodeBlackListTargetRef,
  truncateSelectMenuLabel,
} from "../../../utils/blackList";
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

    const [existing, list] = await Promise.all([
      this.core.blackList.findTarget(blackListId, userId),
      this.core.blackList.find(blackListId),
    ]);

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
              .setMaxLength(BLACK_LIST_LIMIT.label)
              .setValue(existing.label),
          ),
        new LabelBuilder()
          .setLabel("説明")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("description")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(BLACK_LIST_LIMIT.description)
              .setValue(existing.description),
          ),
      );

    if (list?.tags.length) {
      modal.addLabelComponents(
        new LabelBuilder().setLabel("タグ").setStringSelectMenuComponent(
          new StringSelectMenuBuilder()
            .setCustomId("tags")
            .setMinValues(0)
            .setMaxValues(list.tags.length)
            .addOptions(
              list.tags.map((tag) =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(truncateSelectMenuLabel(tag))
                  .setValue(tag)
                  .setDefault(existing.tags.includes(tag)),
              ),
            ),
        ),
      );
    }

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

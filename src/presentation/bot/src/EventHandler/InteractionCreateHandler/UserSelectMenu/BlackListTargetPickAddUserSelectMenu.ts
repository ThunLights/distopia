import { CHARACTER_LIMIT } from "app-core/constant";
import {
  InteractionResponse,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type UserSelectMenuInteraction,
} from "discord.js";
import z from "zod";

import { encodeBlackListTargetRef, truncateSelectMenuLabel } from "../../../utils/blackList";
import { ValidateError, validator } from "../../../utils/validator";
import { ModalSended } from "../Base/Modal/ModalSended";
import { UserSelectMenuInteractionBase } from "../Base/UserSelectMenuInteractionBase";

const customIdPrefix = "blackListTargetPickAddUser:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTargetPickAddUserSelectMenu extends UserSelectMenuInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: UserSelectMenuInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: UserSelectMenuInteraction<CacheType>,
    options: { userId: string },
  ): Promise<
    string | MessagePayload | InteractionReplyOptions | InteractionResponse | ModalSended
  > {
    const blackListId = await validator(
      interaction.customId.slice(customIdPrefix.length),
      BlackListIdSchema,
    );

    if (blackListId instanceof ValidateError) {
      return blackListId.content;
    }

    const allowed = await this.core.blackList.hasPermission(
      blackListId,
      interaction.user.id,
      "AddTarget",
    );

    if (!allowed) {
      return {
        content: "このブラックリストを編集する権限がありません。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const list = await this.core.blackList.find(blackListId);

    const modal = new ModalBuilder()
      .setCustomId(`blackListTargetAdd:${encodeBlackListTargetRef(blackListId, options.userId)}`)
      .setTitle("ブラックリストに追加")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("ラベル")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("label")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(CHARACTER_LIMIT.blackListLabel),
          ),
        new LabelBuilder()
          .setLabel("説明")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("description")
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(CHARACTER_LIMIT.description),
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
                  .setValue(tag),
              ),
            ),
        ),
      );
    }

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

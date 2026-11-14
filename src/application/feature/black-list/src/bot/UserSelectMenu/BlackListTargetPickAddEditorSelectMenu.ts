import {
  CheckboxBuilder,
  InteractionResponse,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type UserSelectMenuInteraction,
} from "discord.js";
import { PermissionError } from "presentation-bot-kit/base/Error/PermissionError";
import { ModalSended } from "presentation-bot-kit/base/Modal/ModalSended";
import { UserSelectMenuInteractionBase } from "presentation-bot-kit/base/UserSelectMenuInteractionBase";
import { ValidateError, validator } from "presentation-bot-kit/validator";
import z from "zod";

const customIdPrefix = "blackListTargetPickAddEditor:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTargetPickAddEditorSelectMenu extends UserSelectMenuInteractionBase {
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

    const permission = await this.checkBlackListOwnerPermission(blackListId, interaction.user.id);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    const modal = new ModalBuilder()
      .setCustomId(`blackListEditorPermission:${blackListId}:${options.userId}`)
      .setTitle("編集者の権限を設定")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("全ての操作を許可")
          .setCheckboxComponent(new CheckboxBuilder().setCustomId("all").setDefault(false)),
        new LabelBuilder()
          .setLabel("対象の追加を許可")
          .setCheckboxComponent(new CheckboxBuilder().setCustomId("add").setDefault(false)),
        new LabelBuilder()
          .setLabel("対象の編集を許可")
          .setCheckboxComponent(new CheckboxBuilder().setCustomId("edit").setDefault(false)),
        new LabelBuilder()
          .setLabel("対象の削除を許可")
          .setCheckboxComponent(new CheckboxBuilder().setCustomId("remove").setDefault(false)),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

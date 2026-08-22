import {
  CheckboxBuilder,
  InteractionResponse,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { BlackListTargetRefSchema, decodeBlackListTargetRef } from "../../../utils/blackList";
import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { PermissionError } from "../Base/Error/PermissionError";
import { ModalSended } from "../Base/Modal/ModalSended";

const customIdPrefix = "blackListEditorPermissionOpen:";

export class BlackListEditorPermissionOpenButton extends ButtonInteractionBase {
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
    const requesterId = interaction.user.id;

    const permission = await this.checkBlackListOwnerPermission(blackListId, requesterId);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    const existing = await this.core.blackList.findEditor(blackListId, userId);

    if (!existing) {
      return { content: "編集者が見つかりませんでした。", flags: [MessageFlags.Ephemeral] };
    }

    const modal = new ModalBuilder()
      .setCustomId(`blackListEditorPermission:${blackListId}:${userId}`)
      .setTitle("編集者の権限を設定")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("全ての操作を許可")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("all").setDefault(existing.allPermissions),
          ),
        new LabelBuilder()
          .setLabel("対象の追加を許可")
          .setCheckboxComponent(
            new CheckboxBuilder()
              .setCustomId("add")
              .setDefault(existing.permissions.includes("AddTarget")),
          ),
        new LabelBuilder()
          .setLabel("対象の編集を許可")
          .setCheckboxComponent(
            new CheckboxBuilder()
              .setCustomId("edit")
              .setDefault(existing.permissions.includes("EditTarget")),
          ),
        new LabelBuilder()
          .setLabel("対象の削除を許可")
          .setCheckboxComponent(
            new CheckboxBuilder()
              .setCustomId("remove")
              .setDefault(existing.permissions.includes("RemoveTarget")),
          ),
      );

    await interaction.showModal(modal);

    return new ModalSended();
  }
}

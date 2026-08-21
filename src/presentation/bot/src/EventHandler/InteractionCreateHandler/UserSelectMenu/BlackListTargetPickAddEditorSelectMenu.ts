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
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { ModalSended } from "../Base/Modal/ModalSended";
import { UserSelectMenuInteractionBase } from "../Base/UserSelectMenuInteractionBase";

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

    const isOwner = await this.core.blackList.isOwner(blackListId, interaction.user.id);

    if (!isOwner) {
      return {
        content: "編集者の管理はブラックリストのオーナーのみ行えます。",
        flags: [MessageFlags.Ephemeral],
      };
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

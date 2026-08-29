import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
} from "discord.js";
import z from "zod";

import { BlackListTargetRefSchema, decodeBlackListTargetRef } from "../../../utils/lists/blackList";
import { validator, ValidateError, type ValidateResult } from "../../../utils/validator";
import { PermissionError } from "../Base/Error/PermissionError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { blackListTargetManageEditorsPage } from "../Page/BlackListTargetManageEditorsPage";

const customIdPrefix = "blackListEditorPermission:";

const OptionsSchema = BlackListTargetRefSchema.extend({
  all: z.boolean(),
  add: z.boolean(),
  edit: z.boolean(),
  remove: z.boolean(),
});

type Options = z.infer<typeof OptionsSchema>;

export class BlackListEditorPermissionModal extends ModalSubmitInteractionBase<Options> {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ModalSubmitInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    const ref = decodeBlackListTargetRef(interaction.customId.slice(customIdPrefix.length));

    if (typeof ref !== "object" || ref === null) {
      return new ValidateError({
        content: "不正なリクエストです。",
        flags: [MessageFlags.Ephemeral],
      });
    }

    return await validator(
      {
        ...ref,
        all: interaction.fields.getCheckbox("all"),
        add: interaction.fields.getCheckbox("add"),
        edit: interaction.fields.getCheckbox("edit"),
        remove: interaction.fields.getCheckbox("remove"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const { blackListId, userId, all, add, edit, remove } = options;
    const requesterId = interaction.user.id;

    const permission = await this.checkBlackListOwnerPermission(blackListId, requesterId);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.blackList.upsertEditor({
      blackListId,
      userId,
      allPermissions: all,
      permissions: [
        ...(add ? (["AddTarget"] as const) : []),
        ...(edit ? (["EditTarget"] as const) : []),
        ...(remove ? (["RemoveTarget"] as const) : []),
      ],
    });

    if (interaction.isFromMessage()) {
      const pagePayload = await blackListTargetManageEditorsPage(
        this.core,
        requesterId,
        blackListId,
      );
      const { content, components, embeds, allowedMentions, files } = pagePayload;

      return await interaction.update({ content, components, embeds, allowedMentions, files });
    }

    return {
      content: `<@${userId}> の編集権限を設定しました。`,
      flags: [MessageFlags.Ephemeral],
    };
  }
}

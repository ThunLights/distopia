import { CHARACTER_LIMIT } from "app-core/constant";
import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
} from "discord.js";
import z from "zod";

import { BlackListTargetRefSchema, decodeBlackListTargetRef } from "../../../utils/blackList";
import { validator, ValidateError, type ValidateResult } from "../../../utils/validator";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";

const customIdPrefix = "blackListTargetEdit:";

const OptionsSchema = BlackListTargetRefSchema.extend({
  description: z.string().max(CHARACTER_LIMIT.description),
});

type Options = z.infer<typeof OptionsSchema>;

export class BlackListTargetEditModal extends ModalSubmitInteractionBase<Options> {
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
      { ...ref, description: interaction.fields.getTextInputValue("description") },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const { blackListId, userId, description } = options;
    const requesterId = interaction.user.id;

    const allowed = await this.core.blackList.hasPermission(blackListId, requesterId, "EditTarget");

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

    await this.core.blackList.upsertTarget({ blackListId, userId, description });

    return { content: "説明を更新しました。", flags: [MessageFlags.Ephemeral] };
  }
}

import { BLACK_LIST_LIMIT } from "app-core/constant";
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
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { blackListTargetManageDetailPage } from "../Page/BlackListTargetManageDetailPage";

const customIdPrefix = "blackListTargetEdit:";

const OptionsSchema = BlackListTargetRefSchema.extend({
  label: z.string().min(1).max(BLACK_LIST_LIMIT.label),
  description: z.string().max(BLACK_LIST_LIMIT.description),
  tags: z.string().array(),
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
      {
        ...ref,
        label: interaction.fields.getTextInputValue("label"),
        description: interaction.fields.getTextInputValue("description"),
        tags: interaction.fields.fields.has("tags")
          ? interaction.fields.getStringSelectValues("tags")
          : [],
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const { blackListId, userId, label, description, tags } = options;
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

    await this.core.blackList.upsertTarget({ blackListId, userId, label, description, tags });

    if (interaction.isFromMessage()) {
      const pagePayload = await blackListTargetManageDetailPage(
        this.core,
        requesterId,
        blackListId,
      );
      const { content, components, embeds, allowedMentions, files } = pagePayload;

      return await interaction.update({ content, components, embeds, allowedMentions, files });
    }

    return { content: "対象を更新しました。", flags: [MessageFlags.Ephemeral] };
  }
}

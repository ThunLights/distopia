import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
} from "discord.js";
import z from "zod";

import { BlackListTagsSchema, parseBlackListTagsInput } from "../../../utils/blackList";
import { validator, ValidateError, type ValidateResult } from "../../../utils/validator";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { blackListTargetManageDetailPage } from "../Page/BlackListTargetManageDetailPage";

const customIdPrefix = "blackListTagsEdit:";

const BlackListIdSchema = z.coerce.number().int();

const OptionsSchema = z.object({
  blackListId: BlackListIdSchema,
  tags: z.string(),
});

type Options = z.infer<typeof OptionsSchema>;

export class BlackListTagsEditModal extends ModalSubmitInteractionBase<Options> {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ModalSubmitInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        blackListId: interaction.customId.slice(customIdPrefix.length),
        tags: interaction.fields.getTextInputValue("tags"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const { blackListId } = options;
    const requesterId = interaction.user.id;

    const isOwner = await this.core.blackList.isOwner(blackListId, requesterId);

    if (!isOwner) {
      return {
        content: "タグの設定はブラックリストのオーナーのみ行えます。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const tags = await validator(parseBlackListTagsInput(options.tags), BlackListTagsSchema);

    if (tags instanceof ValidateError) {
      return tags.content;
    }

    await this.core.blackList.updateTags(blackListId, tags);

    if (interaction.isFromMessage()) {
      const pagePayload = await blackListTargetManageDetailPage(
        this.core,
        requesterId,
        blackListId,
      );
      const { content, components, embeds, allowedMentions, files } = pagePayload;

      return await interaction.update({ content, components, embeds, allowedMentions, files });
    }

    return { content: "タグを更新しました。", flags: [MessageFlags.Ephemeral] };
  }
}

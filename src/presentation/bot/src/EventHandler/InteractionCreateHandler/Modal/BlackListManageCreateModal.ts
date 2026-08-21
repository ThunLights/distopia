import { CHARACTER_LIMIT, MAX_USER_BLACK_LIST_COUNT } from "app-core/constant";
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
import { blackListTargetManagePage } from "../Page/BlackListTargetManagePage";

const OptionsSchema = z.object({
  label: z.string().max(CHARACTER_LIMIT.blackListLabel),
  tags: z.string(),
});

type Options = z.infer<typeof OptionsSchema>;

export class BlackListManageCreateModal extends ModalSubmitInteractionBase<Options> {
  public override customId: string = "blackListManageCreate";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        label: interaction.fields.getTextInputValue("label"),
        tags: interaction.fields.getTextInputValue("tags"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const requesterId = interaction.user.id;

    if (!(await this.core.blackList.canCreate(requesterId))) {
      return {
        content: `作成できるブラックリストは${MAX_USER_BLACK_LIST_COUNT}個までです。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    const tags = await validator(parseBlackListTagsInput(options.tags), BlackListTagsSchema);

    if (tags instanceof ValidateError) {
      return tags.content;
    }

    await this.core.blackList.create(requesterId, options.label, tags);

    if (interaction.isFromMessage()) {
      const pagePayload = await blackListTargetManagePage(this.core, requesterId);
      const { content, components, embeds, allowedMentions, files } = pagePayload;

      return await interaction.update({ content, components, embeds, allowedMentions, files });
    }

    return { content: "ブラックリストを作成しました。", flags: [MessageFlags.Ephemeral] };
  }
}

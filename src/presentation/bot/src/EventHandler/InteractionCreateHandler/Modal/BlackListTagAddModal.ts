import { CHARACTER_LIMIT, NUM_BLACK_LIST_TAG_LIMIT } from "app-core/constant";
import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { blackListTagsManagePage } from "../Page/BlackListTagsManagePage";

const customIdPrefix = "blackListTagAdd:";

const OptionsSchema = z.object({
  blackListId: z.coerce.number().int(),
  tag: z.string().min(1).max(CHARACTER_LIMIT.tag),
});

type Options = z.infer<typeof OptionsSchema>;

export class BlackListTagAddModal extends ModalSubmitInteractionBase<Options> {
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
        tag: interaction.fields.getTextInputValue("tag").trim(),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const { blackListId, tag } = options;
    const requesterId = interaction.user.id;

    const isOwner = await this.core.blackList.isOwner(blackListId, requesterId);

    if (!isOwner) {
      return {
        content: "タグの設定はブラックリストのオーナーのみ行えます。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const list = await this.core.blackList.find(blackListId);
    const currentTags = list?.tags ?? [];

    if (currentTags.includes(tag)) {
      return { content: "そのタグは既に登録されています。", flags: [MessageFlags.Ephemeral] };
    }

    if (currentTags.length >= NUM_BLACK_LIST_TAG_LIMIT) {
      return {
        content: `タグは最大${NUM_BLACK_LIST_TAG_LIMIT}個までです。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    await this.core.blackList.updateTags(blackListId, [...currentTags, tag]);

    if (interaction.isFromMessage()) {
      const pagePayload = await blackListTagsManagePage(this.core, blackListId);
      const { content, components, embeds, allowedMentions, files } = pagePayload;

      return await interaction.update({ content, components, embeds, allowedMentions, files });
    }

    return { content: `タグ「${tag}」を追加しました。`, flags: [MessageFlags.Ephemeral] };
  }
}

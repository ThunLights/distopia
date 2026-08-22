import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { BlackListTagRefSchema, decodeBlackListTagRef } from "../../../utils/blackList";
import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { blackListTagsManagePage } from "../Page/BlackListTagsManagePage";

const customIdPrefix = "blackListTagRemove:";

export class BlackListTagRemoveButton extends ButtonInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const ref = await validator(
      decodeBlackListTagRef(interaction.customId.slice(customIdPrefix.length)),
      BlackListTagRefSchema,
    );

    if (ref instanceof ValidateError) {
      return ref.content;
    }

    const { blackListId, tag } = ref;
    const isOwner = await this.core.blackList.isOwner(blackListId, interaction.user.id);

    if (!isOwner) {
      return {
        content: "タグの設定はブラックリストのオーナーのみ行えます。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const list = await this.core.blackList.find(blackListId);
    const currentTags = list?.tags ?? [];

    await this.core.blackList.updateTags(
      blackListId,
      currentTags.filter((current) => current !== tag),
    );

    const pagePayload = await blackListTagsManagePage(this.core, blackListId);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

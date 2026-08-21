import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { blackListTagsManagePage } from "../Page/BlackListTagsManagePage";

const customIdPrefix = "blackListTagsManageOpen:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTagsManageOpenButton extends ButtonInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
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
        content: "タグの設定はブラックリストのオーナーのみ行えます。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const pagePayload = await blackListTagsManagePage(this.core, blackListId);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

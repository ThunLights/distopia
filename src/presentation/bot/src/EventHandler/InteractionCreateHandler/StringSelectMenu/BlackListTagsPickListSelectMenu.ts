import {
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  type MessagePayload,
  type StringSelectMenuInteraction,
} from "discord.js";
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { blackListTagsManagePage } from "../Page/BlackListTagsManagePage";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTagsPickListSelectMenu extends StringSelectMenuInteractionBase {
  public override customId: string = "blackListTagsPickList";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const blackListId = await validator(options.value, BlackListIdSchema);

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

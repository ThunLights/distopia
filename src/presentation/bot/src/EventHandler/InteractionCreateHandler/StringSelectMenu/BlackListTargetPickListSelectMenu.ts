import {
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  type MessagePayload,
  type StringSelectMenuInteraction,
} from "discord.js";
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { blackListTargetManageDetailPage } from "../Page/BlackListTargetManageDetailPage";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListTargetPickListSelectMenu extends StringSelectMenuInteractionBase {
  public override customId: string = "blackListTargetPickList";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const blackListId = await validator(options.value, BlackListIdSchema);

    if (blackListId instanceof ValidateError) {
      return blackListId.content;
    }

    const pagePayload = await blackListTargetManageDetailPage(
      this.core,
      interaction.user.id,
      blackListId,
    );
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

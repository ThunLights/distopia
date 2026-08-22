import {
  InteractionResponse,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { blackListTargetManagePage } from "../Page/BlackListTargetManagePage";

const customIdPrefix = "blackListTargetManagePageNav:";

const PageSchema = z.coerce.number().int();

export class BlackListTargetManagePageNavButton extends ButtonInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const page = await validator(interaction.customId.slice(customIdPrefix.length), PageSchema);

    if (page instanceof ValidateError) {
      return page.content;
    }

    const pagePayload = await blackListTargetManagePage(this.core, interaction.user.id, page);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

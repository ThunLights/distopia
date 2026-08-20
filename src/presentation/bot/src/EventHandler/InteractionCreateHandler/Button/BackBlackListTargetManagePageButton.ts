import {
  InteractionResponse,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { blackListTargetManagePage } from "../Page/BlackListTargetManagePage";

export class BackBlackListTargetManagePageButton extends ButtonInteractionBase {
  public override customId: string = "backBlackListTargetManagePage";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const pagePayload = await blackListTargetManagePage(this.core, interaction.user.id);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

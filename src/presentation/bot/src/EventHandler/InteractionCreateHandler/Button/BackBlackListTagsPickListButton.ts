import {
  InteractionResponse,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { blackListTagsPickListPage } from "../Page/BlackListTagsPickListPage";

export class BackBlackListTagsPickListButton extends ButtonInteractionBase {
  public override customId: string = "backBlackListTagsPickList";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const pagePayload = await blackListTagsPickListPage(this.core, interaction.user.id);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

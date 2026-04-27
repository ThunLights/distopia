import {
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { page } from "../Page/Ranking/UserBump";

export class PanelRankingUserBumpButton extends ButtonInteractionBase {
  public override customId: string = "panelRankingUserBump";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    if (interaction.user.id !== this.core.state.owner.id) {
      return { content: "権限がありません", flags: [MessageFlags.Ephemeral] };
    }

    return await page(this.core);
  }
}

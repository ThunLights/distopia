import type {
  ButtonInteraction,
  CacheType,
  InteractionReplyOptions,
  MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { page } from "../Page/Ranking/UserBump";

export class PanelRankingUserBumpButton extends ButtonInteractionBase {
  public override customId: string = "panelRankingUserBump";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    return await page(this.core, interaction.client);
  }
}

import type {
  ButtonInteraction,
  CacheType,
  InteractionReplyOptions,
  MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { page } from "../Page/Ranking/Rate";

export class PanelRankingRateButton extends ButtonInteractionBase {
  public override customId: string = "panelRankingRate";

  protected override async exec(
    _interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    return await page(this.core);
  }
}

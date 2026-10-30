import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";

export class TicketCloseButton extends ButtonInteractionBase {
  public override customId: string = "ticketClose";

  protected override async exec(
    _interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    return {
      content: "チケットを閉じますか？作成者と追加メンバーはチャンネルを見られなくなります。",
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("ticketCloseConfirm")
            .setLabel("閉じる")
            .setStyle(ButtonStyle.Danger),
        ),
      ],
      flags: [MessageFlags.Ephemeral],
    };
  }
}

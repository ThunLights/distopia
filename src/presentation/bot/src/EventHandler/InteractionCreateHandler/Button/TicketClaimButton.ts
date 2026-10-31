import {
  EmbedBuilder,
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ticketActor } from "../../../utils/ticket/access";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";

export class TicketClaimButton extends ButtonInteractionBase {
  public override customId: string = "ticketClaim";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const { guild, user, message } = interaction;
    const ticket = await this.core.ticket.findByChannel(interaction.channelId);

    if (!guild || !ticket) {
      return { content: "ここはチケットではありません。", flags: [MessageFlags.Ephemeral] };
    }
    const actor = await ticketActor(guild, user.id);
    if (!(await this.core.ticket.isStaff(guild.id, actor))) {
      return { content: "スタッフのみ操作できます。", flags: [MessageFlags.Ephemeral] };
    }

    const { claimedBy } = ticket;
    if (!this.core.ticket.canChangeClaim(ticket, actor)) {
      return { content: `<@${claimedBy}> が担当しています。`, flags: [MessageFlags.Ephemeral] };
    }

    const next = claimedBy ? null : user.id;
    if (!(await this.core.ticket.setClaimedBy(ticket.channelId, claimedBy, next))) {
      return {
        content: "他のスタッフが先に操作しました。もう一度お試しください。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    return await interaction.update({
      embeds: [
        EmbedBuilder.from(message.embeds[0]!).spliceFields(-1, 1, {
          name: "担当者",
          value: next ? `<@${next}>` : "未割り当て",
          inline: false,
        }),
      ],
    });
  }
}

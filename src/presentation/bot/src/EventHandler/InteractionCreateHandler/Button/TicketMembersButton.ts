import {
  ActionRowBuilder,
  InteractionResponse,
  MessageFlags,
  UserSelectMenuBuilder,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ticketActor } from "../../../utils/ticket/access";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";

export class TicketMembersButton extends ButtonInteractionBase {
  public override customId: string = "ticketMembers";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const { guild, user } = interaction;

    if (!guild || !(await this.core.ticket.isStaff(guild.id, await ticketActor(guild, user.id)))) {
      return { content: "スタッフのみ操作できます。", flags: [MessageFlags.Ephemeral] };
    }

    return {
      content: "選択したメンバーを追加します。既に追加済みのメンバーは削除されます。",
      components: [
        new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
          new UserSelectMenuBuilder()
            .setCustomId("ticketMember")
            .setPlaceholder("追加または削除するメンバー"),
        ),
      ],
      flags: [MessageFlags.Ephemeral],
    };
  }
}

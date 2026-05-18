import {
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { page } from "../Page/Ranking/UserBump";

export class PanelRankingUserBumpButton extends ButtonInteractionBase {
  public override customId: string = "panelRankingUserBump";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    if (interaction.user.id !== this.core.state.owner.id) {
      return { content: "権限がありません", flags: [MessageFlags.Ephemeral] };
    }
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.panel.save({
      guildId: guild.id,
      channelId: interaction.channelId,
      messageId: interaction.message.id,
      type: "UserBumpRanking",
    });

    return await page(this.core);
  }
}

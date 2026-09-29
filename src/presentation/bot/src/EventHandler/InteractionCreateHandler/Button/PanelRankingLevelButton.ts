import {
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  type MessagePayload,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { page } from "../Page/Ranking/Level";

export class PanelRankingLevelButton extends ButtonInteractionBase {
  public override customId: string = "panelRankingLevel";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    if (interaction.user.id !== this.core.state.owner.id) {
      return { content: "権限がありません", flags: [MessageFlags.Ephemeral] };
    }
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    // Reply here ourselves (rather than returning content for the dispatcher to send) so we
    // can record the id of the panel message we're actually creating -- interaction.message
    // is the (ephemeral) message this button is attached to, not the new public reply below,
    // and the dispatcher's own interaction.reply() call happens after exec() already
    // returned, too late to ever learn that reply's id.
    const response = await interaction.reply(await page(this.core));
    const message = await interaction.fetchReply();

    await this.core.panel.save({
      guildId: guild.id,
      channelId: interaction.channelId,
      messageId: message.id,
      type: "LevelRanking",
    });

    return response;
  }
}

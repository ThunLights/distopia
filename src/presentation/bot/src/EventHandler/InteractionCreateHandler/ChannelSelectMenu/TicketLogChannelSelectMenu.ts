import {
  type ChannelSelectMenuInteraction,
  type CacheType,
  type MessagePayload,
  type InteractionReplyOptions,
  MessageFlags,
  type PermissionResolvable,
  InteractionResponse,
} from "discord.js";

import { ChannelSelectMenuInteractionBase } from "../Base/ChannelSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ticketPage } from "../Page/TicketPage";

export class TicketLogChannelSelectMenu extends ChannelSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "ticketLogChannel";

  protected override async exec(
    interaction: ChannelSelectMenuInteraction<CacheType>,
    options: { channelId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({ guildId: guild.id, ticketLogChannel: options.channelId });

    const { content, components, embeds, allowedMentions, files } = await ticketPage(
      this.core,
      guild,
    );

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

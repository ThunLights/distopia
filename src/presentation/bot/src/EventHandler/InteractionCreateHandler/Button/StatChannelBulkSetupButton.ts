import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { statChannelPage } from "../Page/StatChannelPage";

export class StatChannelBulkSetupButton extends ButtonInteractionBase {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["ManageChannels"];
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "statChannelBulkSetup";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const deferred = await interaction.deferUpdate();

    await this.core.statChannel.setupAll(guild.id);

    const statChannelPagePayload = await statChannelPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = statChannelPagePayload;

    await this.safeEditReply(interaction, { content, components, embeds, allowedMentions, files });

    return deferred;
  }
}

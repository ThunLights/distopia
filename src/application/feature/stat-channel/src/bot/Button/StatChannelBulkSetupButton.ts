import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";
import { ButtonInteractionBase } from "presentation-bot-kit/base/ButtonInteractionBase";
import { GuildParseError } from "presentation-bot-kit/base/Error/GuildParseError";

import { setupStatChannels } from "../../StatChannel";
import { statChannelPage } from "../StatChannelPage";

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

    await setupStatChannels(this.core, guild.id);

    const statChannelPagePayload = await statChannelPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = statChannelPagePayload;

    await interaction.editReply({ content, components, embeds, allowedMentions, files });

    return deferred;
  }
}

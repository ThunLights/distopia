import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";

import { isStatChannelField } from "../../../utils/statChannel";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { PermissionError } from "../Base/Error/PermissionError";
import { MessageComponentInteractionBase } from "../Base/MessageComponentInteractionBase";
import { statChannelPage } from "../Page/StatChannelPage";

export class StatChannelSetupSelectMenu extends MessageComponentInteractionBase<
  StringSelectMenuInteraction,
  string | MessagePayload | InteractionReplyOptions | InteractionResponse
> {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["ManageChannels"];
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override readonly customId: string = "statChannelSetup";

  public override async run(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const permission = await this.checkPermission(interaction);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const fields = interaction.values.filter(isStatChannelField);

    await this.core.statChannel.setupAll(guild.id, fields);

    const statChannelPagePayload = await statChannelPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = statChannelPagePayload;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

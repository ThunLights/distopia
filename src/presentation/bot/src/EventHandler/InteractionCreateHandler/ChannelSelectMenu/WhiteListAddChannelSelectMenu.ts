import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ChannelSelectMenuInteractionBase } from "../Base/ChannelSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { whiteListPage } from "../Page/WhiteListPage";

export class WhiteListAddChannelSelectMenu extends ChannelSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "whiteListAddChannel";

  protected override async exec(
    interaction: ChannelSelectMenuInteraction<CacheType>,
    options: { channelId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.upsertWhiteListEntry({
      guildId: guild.id,
      targetId: options.channelId,
      idType: "ChannelId",
      permissions: ["InviteLinkBlock"],
    });

    const whiteListPagePayload = await whiteListPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = whiteListPagePayload;

    return await this.safeUpdate(interaction, {
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

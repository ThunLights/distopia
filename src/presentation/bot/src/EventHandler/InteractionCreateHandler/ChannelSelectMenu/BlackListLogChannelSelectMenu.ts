import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { ChannelSelectMenuInteractionBase } from "../Base/ChannelSelectMenuInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { blackListDetailPage } from "../Page/BlackListDetailPage";

const customIdPrefix = "blackListLogChannel:";

const BlackListIdSchema = z.coerce.number().int();

export class BlackListLogChannelSelectMenu extends ChannelSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(
    interaction: ChannelSelectMenuInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ChannelSelectMenuInteraction<CacheType>,
    options: { channelId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const blackListId = await validator(
      interaction.customId.slice(customIdPrefix.length),
      BlackListIdSchema,
    );

    if (blackListId instanceof ValidateError) {
      return blackListId.content;
    }

    await this.core.blackList.apply({
      guildId: guild.id,
      blackListId,
      logChannel: options.channelId,
    });

    const pagePayload = await blackListDetailPage(this.core, guild, blackListId);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

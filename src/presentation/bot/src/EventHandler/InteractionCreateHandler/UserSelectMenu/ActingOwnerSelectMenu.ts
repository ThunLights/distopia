import {
  type UserSelectMenuInteraction,
  type CacheType,
  type MessagePayload,
  MessageFlags,
  type InteractionReplyOptions,
  type PermissionResolvable,
  InteractionResponse,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { UserSelectMenuInteractionBase } from "../Base/UserSelectMenuInteractionBase";
import { page } from "../Page/Settings";

export class ActingOwnerSelectMenu extends UserSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "actingOwner";

  protected override async exec(
    interaction: UserSelectMenuInteraction<CacheType>,
    options: { userId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({
      guildId: guild.id,
      actingOwner: options.userId,
    });

    const settingPage = await page(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    return await this.safeUpdate(interaction, {
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

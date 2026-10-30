import {
  type RoleSelectMenuInteraction,
  type CacheType,
  type MessagePayload,
  type InteractionReplyOptions,
  MessageFlags,
  type PermissionResolvable,
  InteractionResponse,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { RoleSelectMenuInteractionBase } from "../Base/RoleSelectMenuInteractionBase";
import { ticketPage } from "../Page/TicketPage";

export class TicketRoleSelectMenu extends RoleSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "ticketRole";

  protected override async exec(
    interaction: RoleSelectMenuInteraction<CacheType>,
    options: { roleId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({
      guildId: guild.id,
      ticketRole: options.roleId,
    });

    const settingPage = await ticketPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type RoleSelectMenuInteraction,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { RoleSelectMenuInteractionBase } from "../Base/RoleSelectMenuInteractionBase";
import { whiteListPage } from "../Page/WhiteListPage";

export class WhiteListAddRoleSelectMenu extends RoleSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "whiteListAddRole";

  protected override async exec(
    interaction: RoleSelectMenuInteraction<CacheType>,
    options: { roleId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.upsertWhiteListEntry({
      guildId: guild.id,
      targetId: options.roleId,
      idType: "RoleId",
      permissions: ["InviteLinkBlock"],
    });

    const whiteListPagePayload = await whiteListPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = whiteListPagePayload;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

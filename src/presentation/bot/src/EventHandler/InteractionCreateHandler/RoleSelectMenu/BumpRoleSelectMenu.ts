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
import { page } from "../Page/Settings";

export class BumpRoleSelectMenu extends RoleSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpRole";

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
      bumpNoticeRole: options.roleId,
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

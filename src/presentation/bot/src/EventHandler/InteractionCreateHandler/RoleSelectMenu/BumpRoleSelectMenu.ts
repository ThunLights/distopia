import {
  type RoleSelectMenuInteraction,
  type CacheType,
  type Role,
  type MessagePayload,
  type InteractionReplyOptions,
  type OmitPartialGroupDMChannel,
  type Message,
  MessageFlags,
  type PermissionResolvable,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { RoleSelectMenuInteractionBase } from "../Base/RoleSelectMenuInteractionBase";
import { page } from "../Page/Settings";

export class BumpRoleSelectMenu extends RoleSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpRole";

  protected override async exec(
    interaction: RoleSelectMenuInteraction<CacheType>,
    options: { role: Role },
  ): Promise<
    string | MessagePayload | InteractionReplyOptions | OmitPartialGroupDMChannel<Message<boolean>>
  > {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({
      guildId: guild.id,
      bumpNoticeRole: options.role.id,
    });

    const settingPage = await page(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    return await interaction.message.edit({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

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

import { antiRaidPage } from "../Page/AntiRaidPage";

export class InviteLinkBlockOff extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "inviteLinkBlockOff";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({ guildId: guild.id, inviteLinkBlock: false });

    const settingPage = await antiRaidPage(this.core, guild);

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

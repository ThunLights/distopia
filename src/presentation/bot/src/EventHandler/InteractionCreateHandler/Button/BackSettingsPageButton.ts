import {
  Message,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type OmitPartialGroupDMChannel,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { page } from "../Page/Settings";

export class BackSettingsPageButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "backSettingsPage";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | OmitPartialGroupDMChannel<Message>
  > {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const { content, components, embeds, allowedMentions, files } = await page(this.core, guild);

    return await interaction.message.edit({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

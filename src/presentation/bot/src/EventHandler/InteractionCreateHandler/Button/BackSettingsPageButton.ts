import {
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { GuildParseError } from "../Base/Base";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { page } from "../Page/Settings";

export class BackSettingsPageButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "backSettingsPage";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    return await page(this.core, guild);
  }
}

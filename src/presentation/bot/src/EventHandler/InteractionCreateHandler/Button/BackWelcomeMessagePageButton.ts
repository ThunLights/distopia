import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { welcomeMessagePage } from "../Page/WelcomeMessagePage";

export class BackWelcomeMessagePageButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "backWelcomeMessagePage";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const welcomeMessagePagePayload = await welcomeMessagePage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = welcomeMessagePagePayload;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

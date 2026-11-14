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
import { ValidateError, validator } from "presentation-bot-kit/validator";
import z from "zod";

import { blackListPage } from "../Page/BlackListPage";

const customIdPrefix = "blackListPageNav:";

const PageSchema = z.coerce.number().int();

export class BlackListPageNavButton extends ButtonInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const page = await validator(interaction.customId.slice(customIdPrefix.length), PageSchema);

    if (page instanceof ValidateError) {
      return page.content;
    }

    const pagePayload = await blackListPage(this.core, guild, page);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

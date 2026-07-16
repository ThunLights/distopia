import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ValidateError, validator } from "../../../utils/validator";
import { WhiteListTargetSchema, decodeWhiteListTargetValue } from "../../../utils/whiteList";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { whiteListPage } from "../Page/WhiteListPage";

const customIdPrefix = "whiteListDelete:";

export class WhiteListDeleteButton extends ButtonInteractionBase {
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

    const target = await validator(
      decodeWhiteListTargetValue(interaction.customId.slice(customIdPrefix.length)),
      WhiteListTargetSchema,
    );

    if (target instanceof ValidateError) {
      return target.content;
    }

    await this.core.guild.deleteWhiteListEntry(guild.id, target.targetId);

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

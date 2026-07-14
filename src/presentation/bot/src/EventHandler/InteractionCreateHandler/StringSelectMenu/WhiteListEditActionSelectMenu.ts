import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";

import { ValidateError, validator } from "../../../utils/validator";
import {
  WhiteListEditActionSchema,
  decodeWhiteListEditActionValue,
} from "../../../utils/whiteList";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { whiteListDetailPage } from "../Page/WhiteListDetailPage";

export class WhiteListEditActionSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "whiteListEditAction";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const parsed = await validator(
      decodeWhiteListEditActionValue(options.value),
      WhiteListEditActionSchema,
    );

    if (parsed instanceof ValidateError) {
      return parsed.content;
    }

    const { idType, targetId, action } = parsed;

    if (action === "allOn") {
      await this.core.guild.upsertWhiteListEntry({
        guildId: guild.id,
        targetId,
        idType,
        allPermissions: true,
      });
    } else if (action === "allOff") {
      await this.core.guild.upsertWhiteListEntry({
        guildId: guild.id,
        targetId,
        idType,
        allPermissions: false,
      });
    } else if (action === "inviteLinkBlockOn") {
      await this.core.guild.upsertWhiteListEntry({
        guildId: guild.id,
        targetId,
        idType,
        permissions: ["InviteLinkBlock"],
      });
    } else {
      await this.core.guild.upsertWhiteListEntry({
        guildId: guild.id,
        targetId,
        idType,
        permissions: [],
      });
    }

    const detailPagePayload = await whiteListDetailPage(this.core, guild, idType, targetId);

    const { content, components, embeds, allowedMentions, files } = detailPagePayload;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

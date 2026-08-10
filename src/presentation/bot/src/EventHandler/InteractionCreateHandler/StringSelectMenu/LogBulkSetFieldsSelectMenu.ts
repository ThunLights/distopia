import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";

import { isLogField } from "../../../utils/log";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { PermissionError } from "../Base/Error/PermissionError";
import { MessageComponentInteractionBase } from "../Base/MessageComponentInteractionBase";
import { logPage } from "../Page/LogPage";

const customIdPrefix = "logBulkSetFields:";

export class LogBulkSetFieldsSelectMenu extends MessageComponentInteractionBase<
  StringSelectMenuInteraction,
  string | MessagePayload | InteractionReplyOptions | InteractionResponse
> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override readonly customId: string = customIdPrefix;

  public override async match(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  public override async run(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const permission = await this.checkPermission(interaction);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const channelId = interaction.customId.slice(customIdPrefix.length);
    const fields = interaction.values.filter(isLogField);

    for (const field of fields) {
      await this.core.guild.saveSetting({ guildId: guild.id, [field]: channelId });
    }

    const logPagePayload = await logPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = logPagePayload;

    return await interaction.update({
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

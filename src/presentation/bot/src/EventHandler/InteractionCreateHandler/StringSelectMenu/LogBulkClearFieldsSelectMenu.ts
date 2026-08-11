import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";

import { isLogField, type LogField } from "../../../utils/log";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { PermissionError } from "../Base/Error/PermissionError";
import { MessageComponentInteractionBase } from "../Base/MessageComponentInteractionBase";
import { logPage } from "../Page/LogPage";

export class LogBulkClearFieldsSelectMenu extends MessageComponentInteractionBase<
  StringSelectMenuInteraction,
  string | MessagePayload | InteractionReplyOptions | InteractionResponse
> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override readonly customId: string = "logBulkClearFields";

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

    const fields = interaction.values.filter(isLogField);

    if (!fields.length) {
      return { content: "有効なログ種類が選択されていません。", flags: [MessageFlags.Ephemeral] };
    }

    const updates = fields.reduce<Partial<Record<LogField, null>>>((acc, field) => {
      acc[field] = null;
      return acc;
    }, {});

    await this.core.guild.saveSetting({ guildId: guild.id, ...updates });

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

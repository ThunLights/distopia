import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { isLogField } from "../../../utils/logging/log";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { logPage } from "../Page/LogPage";

const customIdPrefix = "logChannelReset:";

export class LogChannelResetButton extends ButtonInteractionBase {
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

    const field = interaction.customId.slice(customIdPrefix.length);

    if (!isLogField(field)) {
      return { content: `${field}は無効な選択肢です`, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.saveSetting({ guildId: guild.id, [field]: null });

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

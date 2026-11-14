import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";
import { GuildParseError } from "presentation-bot-kit/base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "presentation-bot-kit/base/StringSelectMenuInteractionBase";
import { findSettings } from "presentation-bot-kit/settings";

export class SettingSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "setting";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const entry = findSettings(options.value);

    if (!entry) {
      return { content: `${options.value}は無効な選択肢です`, flags: [MessageFlags.Ephemeral] };
    }

    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const { content, components, embeds, allowedMentions, files } = await entry.page(
      this.core,
      guild,
    );

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

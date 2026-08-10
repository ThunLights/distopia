import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
} from "discord.js";

import { isLogField, logFieldLabels } from "../../../utils/log";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";

export class LogCategorySelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "logCategory";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const { value } = options;

    if (!isLogField(value)) {
      return {
        content: `${value}は無効な選択肢です`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    const label = logFieldLabels[value];
    const settings = await this.core.guild.getSetting(guild.id);
    const currentChannelId = settings?.[value];

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle(label.title)
      .setDescription(label.description)
      .addFields({
        name: "現在の設定",
        value: currentChannelId ? `<#${currentChannelId}>` : "未設定",
      });

    const channelSelector = new ChannelSelectMenuBuilder()
      .setCustomId(`logChannel:${value}`)
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);

    const resetButton = new ButtonBuilder()
      .setCustomId(`logChannelReset:${value}`)
      .setLabel("リセット")
      .setStyle(ButtonStyle.Danger);

    const backButton = new ButtonBuilder()
      .setCustomId("backLogPage")
      .setLabel("ログ設定に戻る")
      .setStyle(ButtonStyle.Secondary);

    return await interaction.update({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelector),
        new ActionRowBuilder<ButtonBuilder>().addComponents(backButton, resetButton),
      ],
    });
  }
}

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

import { isStatChannelField, statChannelLabels } from "../../../utils/statChannel";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";

export class StatChannelSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "statChannel";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const { value } = options;

    if (!isStatChannelField(value)) {
      return {
        content: `${value}は無効な選択肢です`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    const label = statChannelLabels[value];
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
      .setCustomId(`${value}Select`)
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildVoice);

    const resetButton = new ButtonBuilder()
      .setCustomId(`${value}Reset`)
      .setLabel("リセット")
      .setStyle(ButtonStyle.Danger);

    const backButton = new ButtonBuilder()
      .setCustomId("backStatChannelPage")
      .setLabel("統計チャンネル設定に戻る")
      .setStyle(ButtonStyle.Secondary);

    return await this.safeUpdate(interaction, {
      embeds: [embed],
      components: [
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelector),
        new ActionRowBuilder<ButtonBuilder>().addComponents(backButton, resetButton),
      ],
    });
  }
}

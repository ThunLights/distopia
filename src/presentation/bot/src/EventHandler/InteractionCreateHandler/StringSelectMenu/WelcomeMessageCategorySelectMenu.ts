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

import { WelcomeMessenger } from "../../../utils/welcome/WelcomeMessenger";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";

export class WelcomeMessageCategorySelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "welcomeMessageCategory";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const { value } = options;

    if (!WelcomeMessenger.isField(value)) {
      return {
        content: `${value}は無効な選択肢です`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    const label = WelcomeMessenger.labels[value];
    const settings = await this.core.guild.getSetting(guild.id);
    const currentChannelId = settings?.[label.channelField];
    const currentContent = settings?.[label.contentField];

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle(label.title)
      .setDescription(label.description)
      .addFields(
        {
          name: "現在のチャンネル",
          value: currentChannelId ? `<#${currentChannelId}>` : "未設定(OFF)",
        },
        {
          name: "現在の内容",
          value: currentContent ?? `未設定(デフォルト: ${label.defaultContent})`,
        },
      );

    const channelSelector = new ChannelSelectMenuBuilder()
      .setCustomId(`welcomeMessageChannel:${value}`)
      .setMaxValues(1)
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);

    const contentButton = new ButtonBuilder()
      .setCustomId(`welcomeMessageContentSubmit:${value}`)
      .setLabel("内容を設定")
      .setStyle(ButtonStyle.Primary);

    const resetButton = new ButtonBuilder()
      .setCustomId(`welcomeMessageReset:${value}`)
      .setLabel("リセット (OFFにする)")
      .setStyle(ButtonStyle.Danger);

    const backButton = new ButtonBuilder()
      .setCustomId("backWelcomeMessagePage")
      .setLabel("入退出メッセージ設定に戻る")
      .setStyle(ButtonStyle.Secondary);

    return await interaction.update({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelector),
        new ActionRowBuilder<ButtonBuilder>().addComponents(backButton, contentButton, resetButton),
      ],
    });
  }
}

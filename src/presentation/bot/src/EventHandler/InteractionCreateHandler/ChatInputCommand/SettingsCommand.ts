import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { GuildParseError } from "../Base/Base";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {};

export class SettingsCommand extends ChatInputCommandBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "settings",
    description: "設定コマンドです。",
  };

  public override async parseOptions(
    _interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {};
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    _options: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }
    const settings = await this.core.state.database.guildSetting.findUnique({
      where: { guildId: guild.id },
    });
    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle("設定パネル")
      .setDescription("設定を色々変えられます。")
      .addFields(
        { name: "Bump通知", value: settings?.bumpNotice ? "有効" : "無効", inline: false },
        {
          name: "Bump通知用ロール",
          value: settings?.bumpNoticeRole ? `<@&${settings.bumpNoticeRole}>` : "未設定",
          inline: false,
        },
        { name: "Bump通知内容", value: settings?.bumpNoticeContent ?? "未設定", inline: false },
        {
          name: "オーナー代理",
          value: settings?.actingOwner ? `<@${settings.actingOwner}>` : "未設定",
          inline: false,
        },
      );

    const bumpNoticeButton = new ButtonBuilder()
      .setCustomId("bumpNotice")
      .setLabel("Bump通知")
      .setStyle(ButtonStyle.Success);
    const bumpRoleButton = new ButtonBuilder()
      .setCustomId("bumpRole")
      .setLabel("Bump通知ロール")
      .setStyle(ButtonStyle.Primary);
    const actingOwnerButton = new ButtonBuilder()
      .setCustomId("actingOwner")
      .setLabel("代理オーナー設定")
      .setStyle(ButtonStyle.Danger);
    const bumpNoticeContentButton = new ButtonBuilder()
      .setCustomId("bumpNoticeContent")
      .setLabel("Bump時のメッセージを変更")
      .setStyle(ButtonStyle.Primary);

    return {
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          actingOwnerButton,
          bumpNoticeButton,
          bumpRoleButton,
          bumpNoticeContentButton,
        ),
      ],
    };
  }
}

import { SUPPORTER_SERVER_GUILD_IDS } from "app-core/constant";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type PermissionResolvable,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

const OptionsSchema = z.object({
  subCommand: z.string(),
  channelId: z.string().nullable(),
  roleId: z.string().nullable(),
  enabled: z.boolean().nullable(),
});
type Options = z.infer<typeof OptionsSchema>;

function errorReply(description: string): InteractionReplyOptions {
  return {
    embeds: [new EmbedBuilder().setColor("Red").setTitle("エラー").setDescription(description)],
    flags: [MessageFlags.Ephemeral],
  };
}

function okReply(description: string): InteractionReplyOptions {
  return {
    embeds: [new EmbedBuilder().setColor("Green").setTitle("認証設定").setDescription(description)],
    flags: [MessageFlags.Ephemeral],
  };
}

export class VerifyAdminCommand extends ChatInputCommandBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  // Scoped like TTS -- this feature is for distopia's own community, not a general-purpose
  // per-guild offering, so restrict it to the home server and the supporter organizations'
  // servers.
  public override availableGuildId: readonly string[] = [
    this.core.state.homeServerId,
    ...SUPPORTER_SERVER_GUILD_IDS,
  ];

  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "verify-admin",
    description: "メンバー認証機能のサーバー設定を管理します。(管理者のみ)",
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "channel",
        description: "認証案内を投稿するチャンネルを設定します。",
        options: [
          {
            type: ApplicationCommandOptionType.Channel,
            name: "channel",
            description: "認証案内を投稿するチャンネル",
            required: true,
            channel_types: [ChannelType.GuildText],
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "role",
        description: "認証完了後に付与するロールを設定します。",
        options: [
          {
            type: ApplicationCommandOptionType.Role,
            name: "role",
            description: "認証完了ロール",
            required: true,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "pending-role",
        description: "参加直後に付与する未認証ロールを設定します。(任意)",
        options: [
          {
            type: ApplicationCommandOptionType.Role,
            name: "role",
            description: "未認証ロール",
            required: true,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "enable",
        description: "メンバー認証を有効にします。",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "disable",
        description: "メンバー認証を無効にします。",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "post",
        description: "設定済みのチャンネルに認証案内を投稿します。",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "log-channel",
        description:
          "認証結果（メール・VPN検知・サブ垢候補）を記録するログチャンネルを設定します。",
        options: [
          {
            type: ApplicationCommandOptionType.Channel,
            name: "channel",
            description: "ログを投稿するチャンネル",
            required: true,
            channel_types: [ChannelType.GuildText],
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "block-vpn",
        description: "VPN/プロキシ/Tor経由と判定された場合に認証をブロックするか設定します。",
        options: [
          {
            type: ApplicationCommandOptionType.Boolean,
            name: "enabled",
            description: "ブロックするか",
            required: true,
          },
        ],
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        subCommand: interaction.options.getSubcommand(),
        channelId: interaction.options.getChannel("channel", false)?.id ?? null,
        roleId: interaction.options.getRole("role", false)?.id ?? null,
        enabled: interaction.options.getBoolean("enabled", false),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions> {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return errorReply(guild.message);
    }

    const guildId = guild.id;
    const { subCommand, channelId, roleId, enabled } = options;
    const setting = await this.core.verify.getSetting(guildId);

    if (subCommand === "channel" && channelId) {
      await this.core.verify.saveSetting({ guildId, channelId });
      return okReply(`認証案内の投稿先を <#${channelId}> に設定しました。`);
    }

    if (subCommand === "role" && roleId) {
      await this.core.verify.saveSetting({ guildId, roleId });
      return okReply(`認証完了ロールを <@&${roleId}> に設定しました。`);
    }

    if (subCommand === "pending-role" && roleId) {
      await this.core.verify.saveSetting({ guildId, pendingRoleId: roleId });
      return okReply(`未認証ロールを <@&${roleId}> に設定しました。`);
    }

    if (subCommand === "enable") {
      if (!setting?.channelId || !setting.roleId) {
        return errorReply("先に channel と role を設定してください。");
      }
      await this.core.verify.saveSetting({ guildId, enabled: true });
      return okReply("メンバー認証を有効にしました。");
    }

    if (subCommand === "disable") {
      await this.core.verify.saveSetting({ guildId, enabled: false });
      return okReply("メンバー認証を無効にしました。");
    }

    if (subCommand === "post") {
      if (!setting?.channelId) {
        return errorReply("先に channel を設定してください。");
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("認証する")
          .setStyle(ButtonStyle.Link)
          .setURL(`${this.core.state.url}/verify/${guildId}`),
      );

      const channel = await interaction.guild?.channels.fetch(setting.channelId);
      if (!channel?.isTextBased()) {
        return errorReply("投稿先チャンネルが見つかりませんでした。");
      }

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("メンバー認証")
            .setDescription("下のボタンから認証を完了してください。"),
        ],
        components: [row],
      });

      return okReply("認証案内を投稿しました。");
    }

    if (subCommand === "log-channel" && channelId) {
      await this.core.verify.saveSetting({ guildId, logChannelId: channelId });
      return okReply(`ログの投稿先を <#${channelId}> に設定しました。`);
    }

    if (subCommand === "block-vpn" && enabled !== null) {
      await this.core.verify.saveSetting({ guildId, blockVpn: enabled });
      return okReply(`VPN/プロキシ/Torのブロックを${enabled ? "有効" : "無効"}にしました。`);
    }

    return errorReply("コマンドが見つかりませんでした");
  }
}

import { URL } from "node:url";

import {
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { GuildParseError } from "../Base/Base";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

type Options = {
  subCommand: string;
};

export class WebCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "web",
    description: "web",
    options: [
      {
        type: 1,
        name: "edit",
        description: "サーバーの仮登録をする。",
      },
      {
        type: 1,
        name: "invite",
        description: "招待リンクをこのチャンネルに変える。",
      },
      {
        type: 1,
        name: "page",
        description: "このサーバーのページを表示",
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {
      subCommand: interaction.options.getSubcommand(true),
    };
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const { subCommand } = options;
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "page") {
      const registeredGuild = await this.core.guild.find(guild.id);
      if (registeredGuild) {
        return {
          content: new URL(`/guilds/${registeredGuild.guildId}`, this.core.state.url).toString(),
        };
      } else {
        return {
          content: "サーバーが見つかりませんでした。登録が住んでいるか確認してみてください",
          flags: [MessageFlags.Ephemeral],
        };
      }
    }

    if (!interaction.memberPermissions?.has("Administrator")) {
      return {
        content: "管理者権限がありません",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const guildData = await this.core.guild.find(guild.id);

    if (subCommand === "edit") {
      if (guildData) {
        return {
          content: "登録が済んでいます。",
          flags: [MessageFlags.Ephemeral],
        };
      }

      if (!(interaction.channel?.type === ChannelType.GuildText)) {
        return {
          content: "テキストチャンネルでのみ招待リンクを設定することが出来ます。",
          flags: [MessageFlags.Ephemeral],
        };
      }
    } else if (subCommand === "invite") {
      if (!guildData) {
        return {
          content: `サーバーが本登録されていません。\n詳しくは\`/help\`のコマンドを使用してく確認してください`,
          flags: [MessageFlags.Ephemeral],
        };
      }
      if (!(interaction.channel?.type === ChannelType.GuildText)) {
        return {
          content: "テキストチャンネルでのみ招待リンクを設定することが出来ます。",
          flags: [MessageFlags.Ephemeral],
        };
      }

      const invite = await interaction.channel.createInvite();

      await this.core.guild.save(guildData.guildId, { invite: invite.code });

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("招待リンクを更新しました。")
        .setDescription("このチャンネルに新しく招待リンクを作成しました。")
        .addFields({ name: "新しい招待リンク", value: `https://discord.gg/${invite.code}` });

      return { embeds: [embed] };
    }

    return {
      content: "コマンドが見つかりません",
      flags: [MessageFlags.Ephemeral],
    };
  }
}

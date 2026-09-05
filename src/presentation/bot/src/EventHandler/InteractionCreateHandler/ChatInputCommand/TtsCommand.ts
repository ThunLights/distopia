import { SUPPORTER_SERVER_GUILD_IDS } from "app-core/constant";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import z from "zod";

import { isJoined, join, leave } from "../../../utils/tts/session";
import { validator, type ValidateResult } from "../../../utils/validator";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

const OptionsSchema = z.object({
  subCommand: z.string(),
  speakerId: z.number().nullable(),
});
type Options = z.infer<typeof OptionsSchema>;

export class TtsCommand extends ChatInputCommandBase<Options> {
  // Free, unauthenticated, rate-limited VOICEVOX TTS Quest API -- restrict availability to the
  // home server and the supporter organizations' servers so other guilds can't exhaust the
  // shared quota.
  public override availableGuildId: readonly string[] = [
    this.core.state.homeServerId,
    ...SUPPORTER_SERVER_GUILD_IDS,
  ];

  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "tts",
    description: "読み上げボットを操作します。",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "join",
        description: "参加しているボイスチャンネルで読み上げを開始します。",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "leave",
        description: "読み上げを終了しボイスチャンネルから退出します。",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "voice",
        description: "自分の読み上げ音声(話者ID)を設定します。",
        options: [
          {
            type: ApplicationCommandOptionType.Integer,
            name: "speaker_id",
            description: "VOICEVOXの話者ID",
            required: true,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "voice-reset",
        description: "自分の読み上げ音声の設定をサーバーのデフォルトに戻します。",
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        subCommand: interaction.options.getSubcommand(),
        speakerId: interaction.options.getInteger("speaker_id", false),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    options: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const { subCommand, speakerId } = options;
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "join") {
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      const voiceChannel = member?.voice.channel;
      if (!voiceChannel) {
        return {
          content: "先にボイスチャンネルに参加してください。",
          flags: [MessageFlags.Ephemeral],
        };
      }

      const joined = await join(voiceChannel, interaction.channelId);
      return {
        content: joined
          ? `${voiceChannel.name} で読み上げを開始しました。`
          : "ボイスチャンネルへの接続に失敗しました。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "leave") {
      if (!isJoined(guild.id)) {
        return { content: "読み上げは開始されていません。", flags: [MessageFlags.Ephemeral] };
      }
      leave(guild.id);
      return { content: "読み上げを終了しました。", flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "voice" && typeof speakerId === "number") {
      await this.core.tts.setUserSpeaker(interaction.user.id, speakerId);
      return {
        content: `読み上げ音声を話者ID ${speakerId} に設定しました。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "voice-reset") {
      await this.core.tts.clearUserSpeaker(interaction.user.id);
      return { content: "読み上げ音声の設定をリセットしました。", flags: [MessageFlags.Ephemeral] };
    }

    return { content: "コマンドが見つかりませんでした", flags: [MessageFlags.Ephemeral] };
  }
}

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

import { joinLinesWithinLimit } from "../../../utils/discordLimits";
import { isJoined, join, leave } from "../../../utils/tts/session";
import { validator, type ValidateResult } from "../../../utils/validator";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

const WORD_MAX_LENGTH = 50;
const READING_MAX_LENGTH = 50;

const OptionsSchema = z.object({
  subCommandGroup: z.string().nullable(),
  subCommand: z.string(),
  speakerId: z.number().nullable(),
  word: z.string().nullable(),
  reading: z.string().nullable(),
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
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "dictionary",
        description: "自分の読み上げ辞書を管理します。",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "辞書に単語を追加・更新します。",
            options: [
              {
                type: ApplicationCommandOptionType.String,
                name: "word",
                description: "登録する単語",
                required: true,
                max_length: WORD_MAX_LENGTH,
              },
              {
                type: ApplicationCommandOptionType.String,
                name: "reading",
                description: "読み方",
                required: true,
                max_length: READING_MAX_LENGTH,
              },
            ],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "辞書から単語を削除します。",
            options: [
              {
                type: ApplicationCommandOptionType.String,
                name: "word",
                description: "削除する単語",
                required: true,
              },
            ],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "list",
            description: "登録した単語の一覧を表示します。",
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
        subCommandGroup: interaction.options.getSubcommandGroup(false),
        subCommand: interaction.options.getSubcommand(),
        speakerId: interaction.options.getInteger("speaker_id", false),
        word: interaction.options.getString("word", false),
        reading: interaction.options.getString("reading", false),
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
    const { subCommandGroup, subCommand, speakerId } = options;
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    if (subCommandGroup === "dictionary") {
      const result = await this.execDictionary(interaction.user.id, subCommand, options);
      if (result) {
        return result;
      }
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

      // join() can take several seconds to establish the voice connection -- well past
      // Discord's 3-second interaction-ack window. Reply immediately and report the actual
      // outcome via a follow-up instead of awaiting join() before returning; awaiting it here
      // previously caused "Unknown interaction" (10062) once the connection attempt ran long.
      void join(voiceChannel, interaction.channelId)
        .then((joined) =>
          interaction.followUp({
            content: joined
              ? `${voiceChannel.name} で読み上げを開始しました。`
              : "ボイスチャンネルへの接続に失敗しました。",
            flags: [MessageFlags.Ephemeral],
          }),
        )
        .catch((error) => console.error("[tts] failed to send join follow-up", error));

      return {
        content: `${voiceChannel.name} への接続を試みています…`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "leave") {
      if (!isJoined(guild.id)) {
        return { content: "読み上げは開始されていません。", flags: [MessageFlags.Ephemeral] };
      }
      await leave(guild.id);
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

  private async execDictionary(
    userId: string,
    subCommand: string,
    options: Options,
  ): Promise<InteractionReplyOptions | null> {
    const { word, reading } = options;

    if (subCommand === "add" && word && reading) {
      await this.core.dictionary.addUserEntry({ userId, word, reading });
      return {
        content: `辞書に登録しました: ${word} → ${reading}`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "remove" && word) {
      await this.core.dictionary.removeUserEntry(userId, word);
      return { content: `辞書から削除しました: ${word}`, flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "list") {
      const entries = await this.core.dictionary.getUserEntries(userId);
      if (entries.length === 0) {
        return { content: "登録された単語はありません。", flags: [MessageFlags.Ephemeral] };
      }
      const lines = entries.map(({ word: w, reading: r }) => `${w} → ${r}`);
      return { content: joinLinesWithinLimit(lines), flags: [MessageFlags.Ephemeral] };
    }

    return null;
  }
}

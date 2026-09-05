import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type APIApplicationCommandStringOption,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

const formatOption: APIApplicationCommandStringOption = {
  type: ApplicationCommandOptionType.String,
  name: "format",
  description: "ファイル形式",
  required: true,
  choices: [
    { name: "JSON", value: "json" },
    { name: "TOML", value: "toml" },
  ],
};

const userOption = {
  type: ApplicationCommandOptionType.User,
  name: "user",
  description: "対象のユーザー",
  required: true,
} as const;

const channelOption = {
  type: ApplicationCommandOptionType.Channel,
  name: "channel",
  description: "対象のチャンネル",
  required: true,
} as const;

const OptionsSchema = z.object({
  subCommandGroup: z.string().nullable(),
  subCommand: z.string(),
  word: z.string().nullable(),
  reading: z.string().nullable(),
  format: z.enum(["json", "toml"]).nullable(),
  fileUrl: z.string().nullable(),
  mode: z.enum(["merge", "replace"]).nullable(),
  userId: z.string().nullable(),
  channelId: z.string().nullable(),
  speakerId: z.number().nullable(),
  enabled: z.boolean().nullable(),
});
type Options = z.infer<typeof OptionsSchema>;

export class TtsAdminCommand extends ChatInputCommandBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  // Free, unauthenticated, rate-limited VOICEVOX TTS Quest API -- restrict availability to the
  // home server so other guilds can't exhaust the shared quota.
  public override availableGuildId: string | null = this.core.state.homeServerId;

  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "tts-admin",
    description: "読み上げボットのサーバー設定を管理します。(管理者のみ)",
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    options: [
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "dictionary",
        description: "サーバー全体の読み上げ辞書を管理します。",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "サーバー辞書に単語を追加・更新します。",
            options: [
              {
                type: ApplicationCommandOptionType.String,
                name: "word",
                description: "登録する単語",
                required: true,
              },
              {
                type: ApplicationCommandOptionType.String,
                name: "reading",
                description: "読み方",
                required: true,
              },
            ],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "サーバー辞書から単語を削除します。",
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
            description: "サーバー辞書の一覧を表示します。",
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "export",
            description: "サーバー辞書をファイルとして出力します。",
            options: [formatOption],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "import",
            description: "ファイルからサーバー辞書を取り込みます。",
            options: [
              {
                type: ApplicationCommandOptionType.Attachment,
                name: "file",
                description: "辞書ファイル(JSON/TOML)",
                required: true,
              },
              formatOption,
              {
                type: ApplicationCommandOptionType.String,
                name: "mode",
                description: "取り込み方法",
                required: true,
                choices: [
                  { name: "追加(既存と統合)", value: "merge" },
                  { name: "置き換え(既存を削除して上書き)", value: "replace" },
                ],
              },
            ],
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "ignore",
        description: "読み上げ対象外のユーザー・チャンネルを管理します。",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add-user",
            description: "指定ユーザーの発言を読み上げ対象外にします。",
            options: [userOption],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove-user",
            description: "指定ユーザーを対象外リストから外します。",
            options: [userOption],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add-channel",
            description: "指定チャンネルを読み上げ対象外にします。",
            options: [channelOption],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove-channel",
            description: "指定チャンネルを対象外リストから外します。",
            options: [channelOption],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "list",
            description: "読み上げ対象外の一覧を表示します。",
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "settings",
        description: "読み上げの既定設定を変更します。",
        options: [
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "default-voice",
            description: "サーバーのデフォルト読み上げ音声(話者ID)を設定します。",
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
            name: "skip-url",
            description: "URLを読み上げ対象外にするか設定します。",
            options: [
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "enabled",
                description: "有効にする場合true",
                required: true,
              },
            ],
          },
          {
            type: ApplicationCommandOptionType.Subcommand,
            name: "skip-codeblock",
            description: "コードブロックを読み上げ対象外にするか設定します。",
            options: [
              {
                type: ApplicationCommandOptionType.Boolean,
                name: "enabled",
                description: "有効にする場合true",
                required: true,
              },
            ],
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
        word: interaction.options.getString("word", false),
        reading: interaction.options.getString("reading", false),
        format: interaction.options.getString("format", false) as "json" | "toml" | null,
        fileUrl: interaction.options.getAttachment("file", false)?.url ?? null,
        mode: interaction.options.getString("mode", false) as "merge" | "replace" | null,
        userId: interaction.options.getUser("user", false)?.id ?? null,
        channelId: interaction.options.getChannel("channel", false)?.id ?? null,
        speakerId: interaction.options.getInteger("speaker_id", false),
        enabled: interaction.options.getBoolean("enabled", false),
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
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const guildId = guild.id;
    const { subCommandGroup, subCommand } = options;

    if (subCommandGroup === "dictionary") {
      const result = await this.execDictionary(guildId, subCommand, options);
      if (result) {
        return result;
      }
    }

    if (subCommandGroup === "ignore") {
      const result = await this.execIgnore(guildId, subCommand, options);
      if (result) {
        return result;
      }
    }

    if (subCommandGroup === "settings") {
      const result = await this.execSettings(guildId, subCommand, options);
      if (result) {
        return result;
      }
    }

    return { content: "コマンドが見つかりませんでした", flags: [MessageFlags.Ephemeral] };
  }

  private async execDictionary(
    guildId: string,
    subCommand: string,
    options: Options,
  ): Promise<InteractionReplyOptions | null> {
    const { word, reading, format, fileUrl, mode } = options;

    if (subCommand === "add" && word && reading) {
      await this.core.dictionary.addGuildEntry({ guildId, word, reading });
      return {
        content: `サーバー辞書に登録しました: ${word} → ${reading}`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "remove" && word) {
      await this.core.dictionary.removeGuildEntry(guildId, word);
      return { content: `サーバー辞書から削除しました: ${word}`, flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "list") {
      const entries = await this.core.dictionary.getGuildEntries(guildId);
      if (entries.length === 0) {
        return { content: "サーバー辞書は空です。", flags: [MessageFlags.Ephemeral] };
      }
      return {
        content: entries.map(({ word: w, reading: r }) => `${w} → ${r}`).join("\n"),
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "export" && format) {
      const entries = await this.core.dictionary.getGuildEntries(guildId);
      const content = this.core.dictionary.exportGuildDictionary(entries, format);
      const attachment = new AttachmentBuilder(Buffer.from(content, "utf-8"), {
        name: `dictionary.${format}`,
      });
      return { files: [attachment], flags: [MessageFlags.Ephemeral] };
    }

    if (subCommand === "import" && fileUrl && format && mode) {
      const result = await this.core.dictionary.importFromUrl(guildId, fileUrl, format, mode);
      if ("error" in result) {
        const message =
          result.error === "fetch_failed"
            ? "ファイルの取得に失敗しました。"
            : "ファイルの形式が正しくありません。";
        return { content: message, flags: [MessageFlags.Ephemeral] };
      }
      return {
        content: `${result.count}件の単語を取り込みました。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    return null;
  }

  private async execIgnore(
    guildId: string,
    subCommand: string,
    options: Options,
  ): Promise<InteractionReplyOptions | null> {
    const { userId, channelId } = options;

    if (subCommand === "add-user" && userId) {
      await this.core.tts.addIgnore({ guildId, targetId: userId, idType: "UserId" });
      return {
        content: "対象ユーザーを読み上げ対象外にしました。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "remove-user" && userId) {
      await this.core.tts.removeIgnore(guildId, userId);
      return {
        content: "対象ユーザーを読み上げ対象外リストから外しました。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "add-channel" && channelId) {
      await this.core.tts.addIgnore({ guildId, targetId: channelId, idType: "ChannelId" });
      return {
        content: "対象チャンネルを読み上げ対象外にしました。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "remove-channel" && channelId) {
      await this.core.tts.removeIgnore(guildId, channelId);
      return {
        content: "対象チャンネルを読み上げ対象外リストから外しました。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "list") {
      const list = await this.core.tts.getIgnoreList(guildId);
      if (list.length === 0) {
        return { content: "読み上げ対象外の設定はありません。", flags: [MessageFlags.Ephemeral] };
      }
      const content = list
        .map(
          (entry) => `${entry.idType === "UserId" ? "ユーザー" : "チャンネル"}: ${entry.targetId}`,
        )
        .join("\n");
      return { content, flags: [MessageFlags.Ephemeral] };
    }

    return null;
  }

  private async execSettings(
    guildId: string,
    subCommand: string,
    options: Options,
  ): Promise<InteractionReplyOptions | null> {
    const { speakerId, enabled } = options;

    if (subCommand === "default-voice" && typeof speakerId === "number") {
      await this.core.tts.setGuildDefaultSpeaker(guildId, speakerId);
      return {
        content: `サーバーのデフォルト読み上げ音声を話者ID ${speakerId} に設定しました。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "skip-url" && typeof enabled === "boolean") {
      await this.core.tts.setSkipUrl(guildId, enabled);
      return {
        content: `URLの読み上げ除外を${enabled ? "有効" : "無効"}にしました。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    if (subCommand === "skip-codeblock" && typeof enabled === "boolean") {
      await this.core.tts.setSkipCodeBlock(guildId, enabled);
      return {
        content: `コードブロックの読み上げ除外を${enabled ? "有効" : "無効"}にしました。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    return null;
  }
}

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
import { validator, type ValidateResult } from "../../../utils/validator";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";

const WORD_MAX_LENGTH = 50;
const READING_MAX_LENGTH = 50;

const OptionsSchema = z.object({
  subCommand: z.string(),
  word: z.string().nullable(),
  reading: z.string().nullable(),
});
type Options = z.infer<typeof OptionsSchema>;

export class DictionaryCommand extends ChatInputCommandBase<Options> {
  // Personal dictionary entries only matter where the read-aloud feature (TtsCommand /
  // TtsAdminCommand) is actually available -- keep the same guild restriction.
  public override availableGuildId: readonly string[] = [
    this.core.state.homeServerId,
    ...SUPPORTER_SERVER_GUILD_IDS,
  ];

  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
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
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        subCommand: interaction.options.getSubcommand(),
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
    const { subCommand, word, reading } = options;
    const userId = interaction.user.id;

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

    return { content: "コマンドが見つかりませんでした", flags: [MessageFlags.Ephemeral] };
  }
}

import type { LeaderboardEntry } from "app-core/Level";
import {
  EmbedBuilder,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

type Options = {};

function formatEntry({ userId, level, rank }: LeaderboardEntry): string {
  return `**${rank === null ? "ランク外" : `${rank}位`}** <@${userId}> Lv.${level}`;
}

export class LeaderboardCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "leaderboard",
    description: "サーバー内のレベルランキングを表示します。",
  };

  public override async parseOptions(
    _interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return {};
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    _options: Options,
  ): Promise<string | InteractionReplyOptions | MessagePayload> {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const { top, self } = await this.core.level.getLeaderboard(guild.id, interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle("レベルランキング")
      .setDescription([...top, ...(self ? [self] : [])].map(formatEntry).join("\n"));

    return { embeds: [embed] };
  }
}

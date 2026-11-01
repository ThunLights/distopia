import {
  AttachmentBuilder,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

type Options = {};

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
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    // Avatar download + rendering can outlast Discord's 3s initial-response window.
    const deferred = await interaction.deferReply({ withResponse: true });

    try {
      const image = await this.core.level.renderLeaderboard(
        guild.id,
        interaction.user.id,
        interaction.guild?.name ?? "",
        async (userId) => {
          // Rows outlive membership, so a listed user may no longer be in the guild.
          const member = await interaction.guild?.members.fetch(userId).catch(() => null);
          const user =
            member?.user ?? (await interaction.client.users.fetch(userId).catch(() => null));
          return {
            name: member?.displayName ?? user?.displayName ?? "不明なユーザー",
            avatarUrl: (member ?? user)?.displayAvatarURL({ extension: "png", size: 128 }) ?? "",
          };
        },
      );

      await interaction.editReply({
        files: [new AttachmentBuilder(Buffer.from(image), { name: "leaderboard.png" })],
      });
    } catch (error) {
      // Already deferred, so a throw would leave the reply spinning on "thinking..." forever.
      console.error("[leaderboard] failed to render leaderboard", error);
      await interaction.editReply({ content: "ランキング画像の生成に失敗しました。" });
    }

    return deferred;
  }
}

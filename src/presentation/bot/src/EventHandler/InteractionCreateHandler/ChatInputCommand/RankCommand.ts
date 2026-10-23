import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  MessageFlags,
  type CacheType,
  type ChatInputCommandInteraction,
  type InteractionCallbackResponse,
  type InteractionReplyOptions,
  type MessagePayload,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import { renderRankCard } from "../../../utils/rankCard";
import { ChatInputCommandBase } from "../Base/ChatInputCommandBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

type Options = { userId: string };

export class RankCommand extends ChatInputCommandBase<Options> {
  public override register: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: "rank",
    description: "自分または他のユーザーのサーバー内レベルとグローバルレベルを表示します。",
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "user",
        description: "ランクを見たいユーザー (省略すると自分)",
        required: false,
      },
    ],
  };

  public override async parseOptions(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<Options> {
    return { userId: interaction.options.getUser("user")?.id ?? interaction.user.id };
  }

  protected override async exec(
    interaction: ChatInputCommandInteraction<CacheType>,
    { userId }: Options,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>
  > {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const member = await interaction.guild?.members.fetch(userId).catch(() => null);
    const user = member?.user ?? interaction.options.getUser("user") ?? interaction.user;
    if (user.bot) {
      return { content: "ボットのランクは表示できません。", flags: [MessageFlags.Ephemeral] };
    }

    // Avatar download + rendering can outlast Discord's 3s initial-response window.
    const deferred = await interaction.deferReply({ withResponse: true });

    try {
      const { guild: guildCard, global } = await this.core.level.getCards(guild.id, user.id);
      const image = await renderRankCard({
        name: member?.displayName ?? user.displayName,
        avatarUrl: (member ?? user).displayAvatarURL({ extension: "png", size: 256 }),
        guildName: interaction.guild?.name ?? "",
        guild: guildCard,
        global,
      });

      await interaction.editReply({ files: [new AttachmentBuilder(image, { name: "rank.png" })] });
    } catch (error) {
      // Already deferred, so a throw would leave the reply spinning on "thinking..." forever.
      console.error("[rank] failed to render rank card", error);
      await interaction.editReply({ content: "ランクカードの生成に失敗しました。" });
    }

    return deferred;
  }
}

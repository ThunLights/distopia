import {
  type ModalSubmitInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  MessageFlags,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";

type Options = {
  star: number;
  content: string;
};

export class ReviewModal extends ModalSubmitInteractionBase<Options> {
  public override customId: string = "review";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<Options> {
    return {
      star: Number(interaction.fields.getStringSelectValues("star")[0]),
      content: interaction.fields.getTextInputValue("content"),
    };
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse<boolean>> {
    const { star, content } = options;

    if (isNaN(star) || star > 5) {
      return {
        content: `${star}は無効な値です。`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    const userJoinedDate = interaction.guild?.members.cache.get(interaction.user.id)?.joinedAt;
    const threeMonthAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    if (!userJoinedDate || threeMonthAgo > userJoinedDate.getTime()) {
      return {
        content: "参加後90日経っていないアカウントでレビューは投稿できません。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const dbGuild = await this.core.guild.find(guild.id);

    if (!dbGuild) {
      return {
        content: "サーバー登録がされていません",
        flags: [MessageFlags.Ephemeral],
      };
    }

    await this.core.guild.saveReview({
      guildId: guild.id,
      userId: interaction.user.id,
      star,
      content,
    });

    return {
      content: "投稿しました",
      flags: [MessageFlags.Ephemeral],
    };
  }
}

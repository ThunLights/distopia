import { isBlank } from "app-core/blank";
import { CHARACTER_LIMIT } from "app-core/constant";
import {
  type ModalSubmitInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  MessageFlags,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";

const OptionsSchema = z.object({
  star: z
    .union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal("4"), z.literal("5")])
    .transform(Number),
  content: z.string().max(CHARACTER_LIMIT.review),
});

type Options = z.infer<typeof OptionsSchema>;

const threeMonthAgo = 90 * 24 * 60 * 60 * 1000;

export class ReviewModal extends ModalSubmitInteractionBase<Options> {
  public override customId: string = "review";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        star: interaction.fields.getStringSelectValues("star")[0],
        content: interaction.fields.getTextInputValue("content"),
      },
      OptionsSchema,
    );
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

    if (!userJoinedDate || userJoinedDate.getTime() + threeMonthAgo > Date.now()) {
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
      content: (await isBlank(content)) ? null : content,
    });

    return {
      content: "投稿しました",
      flags: [MessageFlags.Ephemeral],
    };
  }
}

import { isBlankSync } from "app-core/blank";
import { CHARACTER_LIMIT, NUM_TAG_LIMIT } from "app-core/constant";
import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { page } from "../Page/Settings";

const OptionsSchema = z.object({
  nsfw: z.boolean(),
  tags: z.string().max(CHARACTER_LIMIT.tag).array().max(NUM_TAG_LIMIT),
  profile: z.string().max(CHARACTER_LIMIT.description),
});

type Options = z.infer<typeof OptionsSchema>;

export class FriendModal extends ModalSubmitInteractionBase<Options> {
  public override customId: string = "friend";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    const tags = interaction.fields
      .getTextInputValue("tags")
      .split("\n")
      .filter((value) => !isBlankSync(value));

    return await validator(
      {
        nsfw: interaction.fields.getCheckbox("nsfw"),
        tags,
        profile: interaction.fields.getTextInputValue("profile"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const user = await this.parseUser(interaction);
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.friend.save({
      userId: user.id,
      username: user.name,
      description: options.profile,
      nsfw: options.nsfw,
      tags: options.tags,
    });

    if (interaction.isFromMessage()) {
      const settingPage = await page(this.core, guild);

      const { content, components, embeds, allowedMentions, files } = settingPage;

      const res = await interaction.update({
        content,
        components,
        embeds,
        allowedMentions,
        files,
      });
      return res;
    } else {
      return {
        content: "変更完了しました。",
        flags: [MessageFlags.Ephemeral],
      };
    }
  }
}

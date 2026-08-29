import { CHARACTER_LIMIT } from "app-core/constant";
import {
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
  type PermissionResolvable,
  InteractionResponse,
  MessageFlags,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { WelcomeMessenger } from "../../../utils/welcome/WelcomeMessenger";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { welcomeMessagePage } from "../Page/WelcomeMessagePage";

const OptionsSchema = z.object({
  content: z.string().min(1).max(CHARACTER_LIMIT.description),
});

type Options = z.infer<typeof OptionsSchema>;

const customIdPrefix = "welcomeMessageContent:";

export class WelcomeMessageContentModal extends ModalSubmitInteractionBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = customIdPrefix;

  public override async match(interaction: ModalSubmitInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        content: interaction.fields.getTextInputValue("content"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const field = interaction.customId.slice(customIdPrefix.length);

    if (!WelcomeMessenger.isField(field)) {
      return { content: `${field}は無効な選択肢です`, flags: [MessageFlags.Ephemeral] };
    }

    const contentField = WelcomeMessenger.labels[field].contentField;

    await this.core.guild.saveSetting({ guildId: guild.id, [contentField]: options.content });

    const welcomeMessagePagePayload = await welcomeMessagePage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = welcomeMessagePagePayload;

    if (interaction.isFromMessage()) {
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

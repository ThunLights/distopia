import { CHARACTER_LIMIT } from "app-core/constant";
import {
  type ModalSubmitInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type PermissionResolvable,
  MessageFlags,
  InteractionResponse,
} from "discord.js";
import z from "zod";

import { validator, type ValidateResult } from "../../../utils/validator";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { page } from "../Page/Settings";

const OptionsSchema = z.object({
  content: z.string().max(CHARACTER_LIMIT.description),
});

type Options = z.infer<typeof OptionsSchema>;

export class BumpNoticeContentModal extends ModalSubmitInteractionBase<Options> {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "bumpNoticeContent";

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

    await this.core.guild.saveSetting({ guildId: guild.id, bumpNoticeContent: options.content });

    const settingPage = await page(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = settingPage;

    if (interaction.isFromMessage()) {
      const res = await this.safeUpdate(interaction, {
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

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
import { PermissionError } from "../Base/Error/PermissionError";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";
import { blackListPage } from "../Page/BlackListPage";

const OptionsSchema = z.object({
  blackListId: z.coerce.number().int(),
});

type Options = z.infer<typeof OptionsSchema>;

export class BlackListApplyModal extends ModalSubmitInteractionBase<Options> {
  public override customId: string = "blackListApply";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        blackListId: interaction.fields.getTextInputValue("blackListId"),
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

    const { blackListId } = options;
    const requesterId = interaction.user.id;

    const permission = await this.checkBlackListOwnerOrEditorPermission(blackListId, requesterId);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.blackList.apply({ guildId: guild.id, blackListId });

    if (interaction.isFromMessage()) {
      const pagePayload = await blackListPage(this.core, guild);
      const { content, components, embeds, allowedMentions, files } = pagePayload;

      return await interaction.update({ content, components, embeds, allowedMentions, files });
    }

    return { content: "適用しました。", flags: [MessageFlags.Ephemeral] };
  }
}

import {
  InteractionResponse,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { decodeIdPageRef, IdPageRefSchema } from "../../../utils/pagination";
import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { blackListTargetManageEditorsPage } from "../Page/BlackListTargetManageEditorsPage";

const customIdPrefix = "blackListTargetManageEditorsPageNav:";

export class BlackListTargetManageEditorsPageNavButton extends ButtonInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const ref = await validator(
      decodeIdPageRef(interaction.customId.slice(customIdPrefix.length)),
      IdPageRefSchema,
    );

    if (ref instanceof ValidateError) {
      return ref.content;
    }

    const pagePayload = await blackListTargetManageEditorsPage(
      this.core,
      interaction.user.id,
      ref.id,
      ref.page,
    );
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

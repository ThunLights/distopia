import {
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { BlackListTargetRefSchema, decodeBlackListTargetRef } from "../../../utils/lists/blackList";
import { ValidateError, validator } from "../../../utils/validator";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { PermissionError } from "../Base/Error/PermissionError";
import { blackListTargetManageEditorsPage } from "../Page/BlackListTargetManageEditorsPage";

const customIdPrefix = "blackListEditorRemove:";

export class BlackListEditorRemoveButton extends ButtonInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const ref = await validator(
      decodeBlackListTargetRef(interaction.customId.slice(customIdPrefix.length)),
      BlackListTargetRefSchema,
    );

    if (ref instanceof ValidateError) {
      return ref.content;
    }

    const { blackListId, userId } = ref;
    const requesterId = interaction.user.id;

    const permission = await this.checkBlackListOwnerPermission(blackListId, requesterId);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.blackList.deleteEditor(blackListId, userId);

    const pagePayload = await blackListTargetManageEditorsPage(this.core, requesterId, blackListId);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

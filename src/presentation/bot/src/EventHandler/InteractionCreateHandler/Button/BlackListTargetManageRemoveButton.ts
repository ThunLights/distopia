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
import { blackListTargetManageDetailPage } from "../Page/BlackListTargetManageDetailPage";

const customIdPrefix = "blackListTargetManageRemove:";

export class BlackListTargetManageRemoveButton extends ButtonInteractionBase {
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

    const allowed = await this.core.blackList.hasPermission(
      blackListId,
      requesterId,
      "RemoveTarget",
    );

    if (!allowed) {
      return {
        content: "このブラックリストを編集する権限がありません。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    await this.core.blackList.deleteTarget(blackListId, userId);

    const pagePayload = await blackListTargetManageDetailPage(this.core, requesterId, blackListId);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

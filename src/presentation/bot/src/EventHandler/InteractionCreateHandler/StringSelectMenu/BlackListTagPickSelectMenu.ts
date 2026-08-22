import { BLACK_LIST_LIMIT } from "app-core/constant";
import {
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionResponse,
  type MessagePayload,
  type StringSelectMenuInteraction,
} from "discord.js";
import z from "zod";

import { ValidateError, validator } from "../../../utils/validator";
import { PermissionError } from "../Base/Error/PermissionError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { blackListTagDetailPage } from "../Page/BlackListTagDetailPage";

const customIdPrefix = "blackListTagPick:";

const BlackListIdSchema = z.coerce.number().int();
const TagSchema = z.string().min(1).max(BLACK_LIST_LIMIT.tag);

export class BlackListTagPickSelectMenu extends StringSelectMenuInteractionBase {
  public override customId: string = customIdPrefix;

  public override async match(
    interaction: StringSelectMenuInteraction<CacheType>,
  ): Promise<boolean> {
    return interaction.customId.startsWith(customIdPrefix);
  }

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const blackListId = await validator(
      interaction.customId.slice(customIdPrefix.length),
      BlackListIdSchema,
    );

    if (blackListId instanceof ValidateError) {
      return blackListId.content;
    }

    const permission = await this.checkBlackListOwnerPermission(blackListId, interaction.user.id);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] };
    }

    const tag = await validator(options.value, TagSchema);

    if (tag instanceof ValidateError) {
      return tag.content;
    }

    const pagePayload = await blackListTagDetailPage(this.core, blackListId, tag);
    const { content, components, embeds, allowedMentions, files } = pagePayload;

    return await interaction.update({ content, components, embeds, allowedMentions, files });
  }
}

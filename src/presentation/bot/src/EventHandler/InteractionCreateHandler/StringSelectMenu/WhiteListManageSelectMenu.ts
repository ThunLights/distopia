import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type StringSelectMenuInteraction,
} from "discord.js";

import { ValidateError, validator } from "../../../utils/validator";
import { WhiteListTargetSchema, decodeWhiteListTargetValue } from "../../../utils/whiteList";
import { GuildParseError } from "../Base/Error/GuildParseError";
import { StringSelectMenuInteractionBase } from "../Base/StringSelectMenuInteractionBase";
import { whiteListDetailPage } from "../Page/WhiteListDetailPage";

export class WhiteListManageSelectMenu extends StringSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "whiteListManage";

  protected override async exec(
    interaction: StringSelectMenuInteraction<CacheType>,
    options: { value: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    const target = await validator(
      decodeWhiteListTargetValue(options.value),
      WhiteListTargetSchema,
    );

    if (target instanceof ValidateError) {
      return target.content;
    }

    const detailPagePayload = await whiteListDetailPage(
      this.core,
      guild,
      target.idType,
      target.targetId,
    );

    const { content, components, embeds, allowedMentions, files } = detailPagePayload;

    return await this.safeUpdate(interaction, {
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

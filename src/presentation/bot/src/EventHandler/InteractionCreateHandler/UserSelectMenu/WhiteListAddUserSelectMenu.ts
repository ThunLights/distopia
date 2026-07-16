import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type UserSelectMenuInteraction,
} from "discord.js";

import { GuildParseError } from "../Base/Error/GuildParseError";
import { UserSelectMenuInteractionBase } from "../Base/UserSelectMenuInteractionBase";
import { whiteListPage } from "../Page/WhiteListPage";

export class WhiteListAddUserSelectMenu extends UserSelectMenuInteractionBase {
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];
  public override customId: string = "whiteListAddUser";

  protected override async exec(
    interaction: UserSelectMenuInteraction<CacheType>,
    options: { userId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const guild = await this.parseGuild(interaction);

    if (guild instanceof GuildParseError) {
      return { content: guild.message, flags: [MessageFlags.Ephemeral] };
    }

    await this.core.guild.upsertWhiteListEntry({
      guildId: guild.id,
      targetId: options.userId,
      idType: "UserId",
      permissions: ["InviteLinkBlock"],
    });

    const whiteListPagePayload = await whiteListPage(this.core, guild);

    const { content, components, embeds, allowedMentions, files } = whiteListPagePayload;

    return await this.safeUpdate(interaction, {
      content,
      components,
      embeds,
      allowedMentions,
      files,
    });
  }
}

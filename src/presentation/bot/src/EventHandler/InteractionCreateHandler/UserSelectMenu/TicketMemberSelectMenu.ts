import {
  ChannelType,
  InteractionResponse,
  MessageFlags,
  OverwriteType,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
  type UserSelectMenuInteraction,
} from "discord.js";

import { isTicketStaff, TICKET_ACCESS } from "../../../utils/ticket/access";
import { UserSelectMenuInteractionBase } from "../Base/UserSelectMenuInteractionBase";

export class TicketMemberSelectMenu extends UserSelectMenuInteractionBase {
  // Editing channel overwrites requires ManageRoles, unlike creating them with the channel.
  public override requireBotGuildPermissions: PermissionResolvable[] = ["ManageRoles"];
  public override customId: string = "ticketMember";

  protected override async exec(
    interaction: UserSelectMenuInteraction<CacheType>,
    { userId }: { userId: string },
  ): Promise<string | MessagePayload | InteractionReplyOptions | InteractionResponse> {
    const { channel, guild, user } = interaction;
    const ticket = await this.core.ticket.findByChannel(interaction.channelId);

    if (!guild || !ticket || channel?.type !== ChannelType.GuildText) {
      return { content: "ここはチケットではありません。", flags: [MessageFlags.Ephemeral] };
    }
    if (!(await isTicketStaff(this.core, guild, user.id))) {
      return { content: "スタッフのみ操作できます。", flags: [MessageFlags.Ephemeral] };
    }
    if (userId === ticket.userId || userId === interaction.client.user.id) {
      return {
        content: "チケットの作成者とボットは変更できません。",
        flags: [MessageFlags.Ephemeral],
      };
    }

    // Acknowledged first: an expired interaction would hide a change a retry would then reverse.
    const res = await interaction.deferUpdate();

    const remove = channel.permissionOverwrites.cache.has(userId);
    if (remove) {
      await channel.permissionOverwrites.delete(userId);
    } else {
      await channel.permissionOverwrites.edit(
        userId,
        Object.fromEntries(TICKET_ACCESS.map((permission) => [permission, true])),
        { type: OverwriteType.Member },
      );
    }

    const content = `<@${userId}> をチケット${remove ? "から削除" : "に追加"}しました。`;
    await interaction.editReply({ content, allowedMentions: { users: [] } });
    await channel.send({ content, allowedMentions: { users: remove ? [] : [userId] } });
    return res;
  }
}

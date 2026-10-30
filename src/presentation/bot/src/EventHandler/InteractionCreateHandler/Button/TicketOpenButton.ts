import {
  DiscordAPIError,
  InteractionResponse,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  RESTJSONErrorCodes,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type CacheType,
  type Guild,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";
import { ModalSended } from "../Base/Modal/ModalSended";

export class TicketOpenButton extends ButtonInteractionBase {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["ManageChannels"];
  public override customId: string = "ticketOpen";

  // A row whose channel was deleted by hand must not block the user forever.
  private async findOpenChannelId(guild: Guild, userId: string) {
    const ticket = await this.core.ticket.find(guild.id, userId);
    if (!ticket) {
      return null;
    }
    try {
      await guild.channels.fetch(ticket.channelId);
    } catch (error) {
      // Any other error is inconclusive: dropping the row could give the user a second ticket.
      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel) {
        await this.core.ticket.delete(ticket.channelId);
        return null;
      }
    }
    return ticket.channelId;
  }

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<
    string | InteractionReplyOptions | MessagePayload | InteractionResponse | ModalSended
  > {
    const { guild, user } = interaction;
    if (!guild) {
      return { content: "サーバー内で実行してください。", flags: [MessageFlags.Ephemeral] };
    }

    const openChannelId = await this.findOpenChannelId(guild, user.id);
    if (openChannelId) {
      return {
        content: `既にチケットを開いています: <#${openChannelId}>`,
        flags: [MessageFlags.Ephemeral],
      };
    }

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId("ticketOpenContent")
        .setTitle("チケットを作成")
        .addLabelComponents(
          new LabelBuilder()
            .setLabel("件名")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("subject")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100),
            ),
          new LabelBuilder()
            .setLabel("お問い合わせ内容")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("content")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1000),
            ),
        ),
    );

    return new ModalSended();
  }
}

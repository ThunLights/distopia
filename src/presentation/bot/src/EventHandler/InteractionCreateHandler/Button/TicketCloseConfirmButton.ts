import {
  AttachmentBuilder,
  ChannelType,
  EmbedBuilder,
  InteractionResponse,
  MessageFlags,
  type ButtonInteraction,
  type CacheType,
  type InteractionReplyOptions,
  type MessagePayload,
  type PermissionResolvable,
} from "discord.js";

import { staffOverwrites, ticketActor } from "../../../utils/ticket/access";
import { fetchMessages, formatTranscript } from "../../../utils/ticket/transcript";
import { ButtonInteractionBase } from "../Base/ButtonInteractionBase";

export class TicketCloseConfirmButton extends ButtonInteractionBase {
  public override requireBotGuildPermissions: PermissionResolvable[] = [
    "ManageChannels",
    "ManageRoles",
  ];
  public override customId: string = "ticketCloseConfirm";

  protected override async exec(
    interaction: ButtonInteraction<CacheType>,
  ): Promise<string | InteractionReplyOptions | MessagePayload | InteractionResponse> {
    const { channel, guild, user } = interaction;
    const ticket = await this.core.ticket.findByChannel(interaction.channelId);

    if (!guild || !ticket || channel?.type !== ChannelType.GuildText) {
      return { content: "ここはチケットではありません。", flags: [MessageFlags.Ephemeral] };
    }
    if (!(await this.core.ticket.canClose(ticket, await ticketActor(guild, user.id)))) {
      return { content: "作成者とスタッフのみ操作できます。", flags: [MessageFlags.Ephemeral] };
    }

    const res = await interaction.update({
      content: "チケットを閉じています...",
      components: [],
    });

    const settings = await this.core.guild.getSetting(guild.id);

    try {
      if (settings?.ticketLogChannel) {
        const log = await guild.channels.fetch(settings.ticketLogChannel);
        if (!log?.isSendable()) {
          throw new Error("log channel is not sendable");
        }

        await log.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Navy")
              .setTitle("チケットクローズ")
              .addFields(
                { name: "チャンネル", value: channel.name, inline: false },
                { name: "作成者", value: `<@${ticket.userId}>`, inline: true },
                { name: "クローズ", value: `<@${user.id}>`, inline: true },
                {
                  name: "担当者",
                  value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : "未割り当て",
                  inline: true,
                },
              ),
          ],
          files: [
            new AttachmentBuilder(Buffer.from(formatTranscript(await fetchMessages(channel))), {
              name: `${channel.name}.txt`,
            }),
          ],
        });
      }

      await channel.edit({
        name: `closed-${channel.name}`,
        permissionOverwrites: staffOverwrites(
          channel.permissionOverwrites.cache,
          interaction.client.user.id,
        ),
      });
    } catch {
      await interaction.editReply(
        "チケットを閉じられませんでした。管理者はログチャンネルの設定とボットの権限を確認してください。",
      );
      return res;
    }

    await this.core.ticket.delete(channel.id);
    await channel.send({
      content: `<@${user.id}> がチケットを閉じました。`,
      allowedMentions: { users: [] },
    });
    await interaction.editReply("チケットを閉じました。");
    return res;
  }
}

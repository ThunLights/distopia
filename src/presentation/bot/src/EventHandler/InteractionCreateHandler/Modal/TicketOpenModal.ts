import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  InteractionResponse,
  MessageFlags,
  OverwriteType,
  type CacheType,
  type InteractionReplyOptions,
  type ModalSubmitInteraction,
  type PermissionResolvable,
} from "discord.js";
import z from "zod";

import { TICKET_ACCESS } from "../../../utils/ticket/access";
import { validator, type ValidateResult } from "../../../utils/validator";
import { ModalSubmitInteractionBase } from "../Base/ModalSubmitInteractionBase";

// Trimmed so a whitespace-only value cannot reach Discord, which rejects blank embed fields.
const OptionsSchema = z.object({
  subject: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(1000),
});

type Options = z.infer<typeof OptionsSchema>;

export class TicketOpenModal extends ModalSubmitInteractionBase<Options> {
  public override requireBotGuildPermissions: PermissionResolvable[] = ["ManageChannels"];
  public override customId: string = "ticketOpenContent";

  public override async parseOptions(
    interaction: ModalSubmitInteraction<CacheType>,
  ): Promise<ValidateResult<Options>> {
    return await validator(
      {
        subject: interaction.fields.getTextInputValue("subject"),
        content: interaction.fields.getTextInputValue("content"),
      },
      OptionsSchema,
    );
  }

  protected override async exec(
    interaction: ModalSubmitInteraction<CacheType>,
    options: Options,
  ): Promise<InteractionReplyOptions | InteractionResponse> {
    const { guild, user } = interaction;
    if (!guild) {
      return { content: "サーバー内で実行してください。", flags: [MessageFlags.Ephemeral] };
    }

    const res = await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const settings = await this.core.guild.getSetting(guild.id);
    const role = settings?.ticketRole;

    const channel = await guild.channels
      .create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: settings?.ticketCategory ?? undefined,
        permissionOverwrites: [
          { id: guild.id, type: OverwriteType.Role, deny: ["ViewChannel"] },
          { id: interaction.client.user.id, type: OverwriteType.Member, allow: TICKET_ACCESS },
          { id: user.id, type: OverwriteType.Member, allow: TICKET_ACCESS },
          ...(role ? [{ id: role, type: OverwriteType.Role, allow: TICKET_ACCESS }] : []),
        ],
      })
      .catch(() => null);

    if (!channel) {
      await interaction.editReply(
        "チケットを作成できませんでした。管理者はボットの権限と、カテゴリ・ロールの設定を確認してください。",
      );
      return res;
    }

    // Double submit: the second request loses on the unique key and removes its channel.
    const created = await this.core.ticket.create({
      channelId: channel.id,
      guildId: guild.id,
      userId: user.id,
    });
    if (!created) {
      await channel.delete();
      const existing = await this.core.ticket.find(guild.id, user.id);
      await interaction.editReply(`既にチケットを開いています: <#${existing?.channelId}>`);
      return res;
    }

    await channel.send({
      content: [`<@${user.id}>`, ...(role ? [`<@&${role}>`] : [])].join(" "),
      allowedMentions: { users: [user.id], roles: role ? [role] : [] },
      embeds: [
        new EmbedBuilder()
          .setColor("Navy")
          .setTitle("チケット")
          .setDescription("スタッフが対応します。\n解決したら下のボタンで閉じてください。")
          .addFields(
            { name: "件名", value: options.subject, inline: false },
            { name: "お問い合わせ内容", value: options.content, inline: false },
            { name: "担当者", value: "未割り当て", inline: false },
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("ticketClose")
            .setLabel("チケットを閉じる")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("ticketClaim")
            .setLabel("担当する / 解除")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("ticketMembers")
            .setLabel("メンバー管理")
            .setStyle(ButtonStyle.Secondary),
        ),
      ],
    });

    await interaction.editReply(`チケットを作成しました: <#${channel.id}>`);
    return res;
  }
}

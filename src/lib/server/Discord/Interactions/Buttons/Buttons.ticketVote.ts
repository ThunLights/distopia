import {
	ActionRowBuilder,
	EmbedBuilder,
	MessageFlags,
	PermissionsBitField,
	ButtonBuilder,
	ButtonStyle
} from "discord.js";
import { PUBLIC_TICKET_VOTE_CHANNEL_ID } from "$env/static/public";
import { ButtonsBase, ButtonsError } from "./Buttons.base";
import { errorHandling } from "$lib/server/error";
import { codeBlock } from "$lib/codeblock";
import { database } from "$lib/server/Database/index";

import type {
	ButtonInteraction,
	CacheType,
	MessagePayload,
	InteractionReplyOptions
} from "discord.js";

export class TicketVoteButton extends ButtonsBase {
	public readonly customId = "ticketVote";

	private async putVotePanel(interaction: ButtonInteraction<CacheType>, targetUserId: string) {
		try {
			const channel = this.client.channels.cache.get(PUBLIC_TICKET_VOTE_CHANNEL_ID);
			if (channel && channel.isSendable()) {
				const embed = new EmbedBuilder()
					.setColor("Navy")
					.setTitle("危険人物削除投票")
					.setDescription("削除投票を行います。以下のボタンで投票をしてください。投票は匿名です。")
					.setFields({ name: "参考資料", value: `<#${interaction.channelId}>` });
				const message = await channel.send({
					content: `投票状況\n${codeBlock(`賛成:0 vs 反対:0`)}`,
					embeds: [embed],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setCustomId("ticketVoteAgree")
								.setLabel("賛成")
								.setStyle(ButtonStyle.Success),
							new ButtonBuilder()
								.setCustomId("ticketVoteDisagree")
								.setLabel("反対")
								.setStyle(ButtonStyle.Danger),
							new ButtonBuilder()
								.setCustomId("ticketVoteEnd")
								.setLabel("投票終了")
								.setStyle(ButtonStyle.Secondary)
						)
					]
				});
				await message.reply("@everyone");
				await database.ticket.votePanel.update(message.id, targetUserId);
			}
		} catch (error) {
			errorHandling(error);
		}
	}

	public async commands(
		interaction: ButtonInteraction<CacheType>
	): Promise<void | string | MessagePayload | InteractionReplyOptions | ButtonsError | null> {
		if (!interaction.guild) {
			return { content: "ERR", flags: [MessageFlags.Ephemeral] } satisfies InteractionReplyOptions;
		}
		if (
			!(
				interaction.memberPermissions &&
				interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)
			)
		) {
			return {
				content: "権限がありません",
				flags: [MessageFlags.Ephemeral]
			} satisfies InteractionReplyOptions;
		}
		const data = await database.ticket.fetchChannelId(interaction.channelId);
		if (!data) {
			return { content: "ERR", flags: [MessageFlags.Ephemeral] } satisfies InteractionReplyOptions;
		}

		await this.putVotePanel(interaction, data.userId);

		const embed = new EmbedBuilder()
			.setTitle("投票を開始しました。")
			.setDescription("しばしお待ちください")
			.setColor("Navy");

		return {
			embeds: [embed],
			flags: [MessageFlags.Ephemeral]
		} satisfies InteractionReplyOptions;
	}
}
